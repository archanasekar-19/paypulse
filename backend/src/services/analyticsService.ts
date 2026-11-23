import { prisma } from '../db/prisma'

function toNum(val: any, decimals = 0): number {
  if (val === null || val === undefined) return 0
  const n = typeof val === 'bigint' ? Number(val) : Number(val)
  if (isNaN(n)) return 0
  if (decimals === 0) return Math.round(n)
  return Number(n.toFixed(decimals))
}

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const DEFAULT_ANALYTICS_TTL_MS = 60 * 1000 // 60 seconds TTL

export class AnalyticsService {
  private cache = new Map<string, CacheEntry<any>>()

  /**
   * Clears all cached analytics data (called when employees or salaries mutate)
   */
  public clearCache(): void {
    this.cache.clear()
  }

  /**
   * Retrieves diagnostic cache statistics (size and active keys)
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  /**
   * Gets a value from cache if present and not expired
   */
  public getCached<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    return entry.data as T
  }

  /**
   * Sets a value in the cache with the given TTL
   */
  public setCache<T>(key: string, data: T, ttlMs = DEFAULT_ANALYTICS_TTL_MS): T {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs
    })
    return data
  }

  /**
   * Helper to retrieve from cache or compute and store
   */
  private async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttlMs = DEFAULT_ANALYTICS_TTL_MS): Promise<T> {
    const cached = this.getCached<T>(key)
    if (cached !== null) {
      return cached
    }
    const fresh = await fetchFn()
    return this.setCache(key, fresh, ttlMs)
  }

  /**
   * Calculates company-wide compensation KPIs directly in SQL using B-Tree indexes
   * (Preserved for existing dashboard KPI cards)
   */
  async getSummaryMetrics() {
    return this.getOrSet('summary_metrics', async () => {
      // Total Global Headcount includes all employee records (regardless of active/inactive status)
      const totalEmployees = await prisma.employee.count()
      if (totalEmployees === 0) {
        return {
          totalEmployees: 0,
          totalPayrollUSD: 0,
          averageSalaryUSD: 0,
          medianSalaryUSD: 0,
          departmentBreakdown: [],
          countryBreakdown: []
        }
      }

      const whereActive = { status: 'ACTIVE' }
      const activeCount = await prisma.employee.count({ where: whereActive })
      const payrollFilter = activeCount > 0 ? whereActive : {}

      // 1. Total & Average USD Payroll using DB aggregate
      const aggregate = await prisma.employee.aggregate({
        where: payrollFilter,
        _sum: { baseSalaryUSD: true },
        _avg: { baseSalaryUSD: true }
      })

      const totalPayrollUSD = Math.round(aggregate._sum.baseSalaryUSD || 0)
      const averageSalaryUSD = Math.round(aggregate._avg.baseSalaryUSD || 0)

      // 2. Exact Median Salary Calculation (O(log N) lookup using index on baseSalaryUSD)
      const middleOffset = Math.floor((activeCount || totalEmployees) / 2)
      const medianRecord = await prisma.employee.findFirst({
        where: payrollFilter,
        skip: middleOffset,
        orderBy: { baseSalaryUSD: 'asc' },
        select: { baseSalaryUSD: true }
      })
      const medianSalaryUSD = medianRecord ? Math.round(medianRecord.baseSalaryUSD) : 0

      // 3. Department Breakdown (Headcount includes all staff in department)
      const deptGroups = await prisma.employee.groupBy({
        by: ['department'],
        _count: { _all: true },
        _sum: { baseSalaryUSD: true },
        _avg: { baseSalaryUSD: true }
      })

      const departmentBreakdown = deptGroups.map((group) => ({
        department: group.department,
        headcount: group._count._all,
        totalSpendUSD: Math.round(group._sum.baseSalaryUSD || 0),
        averageSalaryUSD: Math.round(group._avg.baseSalaryUSD || 0)
      }))

      // 4. Country Breakdown (Headcount includes all staff in country)
      const countryGroups = await prisma.employee.groupBy({
        by: ['country', 'currency'],
        _count: { _all: true },
        _sum: { baseSalaryUSD: true }
      })

      const countryBreakdown = countryGroups.map((group) => ({
        country: group.country,
        currency: group.currency,
        headcount: group._count._all,
        totalSpendUSD: Math.round(group._sum.baseSalaryUSD || 0)
      }))

      return {
        totalEmployees,
        totalPayrollUSD,
        averageSalaryUSD,
        medianSalaryUSD,
        departmentBreakdown,
        countryBreakdown
      }
    })
  }

  /**
   * 1. Org Overview (SQL Aggregated)
   * Headcount, total payroll cost (in USD), median, average, min, max
   */
  async getOrgOverview() {
    return this.getOrSet('org_overview', async () => {
      const raw = await prisma.$queryRawUnsafe<any[]>(`
        WITH OrderedPay AS (
          SELECT baseSalaryUSD,
                 ROW_NUMBER() OVER (ORDER BY baseSalaryUSD) as row_num,
                 COUNT(*) OVER () as total_cnt
          FROM employees
          WHERE status = 'ACTIVE'
        )
        SELECT 
          (SELECT COUNT(*) FROM employees) as headcount,
          (SELECT ROUND(SUM(baseSalaryUSD), 2) FROM employees WHERE status = 'ACTIVE') as totalPayrollUSD,
          (SELECT ROUND(AVG(baseSalaryUSD), 2) FROM employees WHERE status = 'ACTIVE') as avgSalaryUSD,
          (SELECT ROUND(MIN(baseSalaryUSD), 2) FROM employees WHERE status = 'ACTIVE') as minSalaryUSD,
          (SELECT ROUND(MAX(baseSalaryUSD), 2) FROM employees WHERE status = 'ACTIVE') as maxSalaryUSD,
          (SELECT ROUND(AVG(baseSalaryUSD), 2) FROM OrderedPay WHERE row_num IN ((total_cnt + 1) / 2, (total_cnt + 2) / 2)) as medianSalaryUSD
      `)

      const row = raw[0] || {}
      return {
        headcount: toNum(row.headcount),
        totalPayrollUSD: toNum(row.totalPayrollUSD),
        avgSalaryUSD: toNum(row.avgSalaryUSD),
        medianSalaryUSD: toNum(row.medianSalaryUSD),
        minSalaryUSD: toNum(row.minSalaryUSD),
        maxSalaryUSD: toNum(row.maxSalaryUSD)
      }
    })
  }

  /**
   * 2. By Country (SQL Aggregated)
   * Headcount, min/max/median/average (local and USD), and total cost
   */
  async getByCountry() {
    return this.getOrSet('by_country', async () => {
      const raw = await prisma.$queryRawUnsafe<any[]>(`
        WITH RankedByCountry AS (
          SELECT country, currency, baseSalary, baseSalaryUSD,
                 ROW_NUMBER() OVER (PARTITION BY country ORDER BY baseSalary) as rnk_local,
                 ROW_NUMBER() OVER (PARTITION BY country ORDER BY baseSalaryUSD) as rnk_usd,
                 COUNT(*) OVER (PARTITION BY country) as cnt
          FROM employees
          WHERE status = 'ACTIVE'
        ),
        Medians AS (
          SELECT country,
                 AVG(baseSalary) as medianSalaryLocal,
                 AVG(baseSalaryUSD) as medianSalaryUSD
          FROM RankedByCountry
          WHERE rnk_local IN ((cnt + 1) / 2, (cnt + 2) / 2)
          GROUP BY country
        ),
        Aggs AS (
          SELECT country, currency,
                 COUNT(*) as headcount,
                 ROUND(SUM(baseSalary), 2) as totalCostLocal,
                 ROUND(SUM(baseSalaryUSD), 2) as totalCostUSD,
                 ROUND(MIN(baseSalary), 2) as minSalaryLocal,
                 ROUND(MAX(baseSalary), 2) as maxSalaryLocal,
                 ROUND(AVG(baseSalary), 2) as avgSalaryLocal,
                 ROUND(MIN(baseSalaryUSD), 2) as minSalaryUSD,
                 ROUND(MAX(baseSalaryUSD), 2) as maxSalaryUSD,
                 ROUND(AVG(baseSalaryUSD), 2) as avgSalaryUSD
          FROM employees
          WHERE status = 'ACTIVE'
          GROUP BY country, currency
        )
        SELECT a.country, a.currency, a.headcount,
               a.totalCostLocal, a.totalCostUSD,
               a.minSalaryLocal, a.maxSalaryLocal, a.avgSalaryLocal,
               ROUND(m.medianSalaryLocal, 2) as medianSalaryLocal,
               a.minSalaryUSD, a.maxSalaryUSD, a.avgSalaryUSD,
               ROUND(m.medianSalaryUSD, 2) as medianSalaryUSD
        FROM Aggs a
        JOIN Medians m ON a.country = m.country
        ORDER BY a.headcount DESC
      `)

      return raw.map((r) => ({
        country: String(r.country),
        currency: String(r.currency),
        headcount: toNum(r.headcount),
        totalCostLocal: toNum(r.totalCostLocal),
        totalCostUSD: toNum(r.totalCostUSD),
        minSalaryLocal: toNum(r.minSalaryLocal),
        maxSalaryLocal: toNum(r.maxSalaryLocal),
        avgSalaryLocal: toNum(r.avgSalaryLocal),
        medianSalaryLocal: toNum(r.medianSalaryLocal),
        minSalaryUSD: toNum(r.minSalaryUSD),
        maxSalaryUSD: toNum(r.maxSalaryUSD),
        avgSalaryUSD: toNum(r.avgSalaryUSD),
        medianSalaryUSD: toNum(r.medianSalaryUSD)
      }))
    })
  }

  /**
   * 3. By Department and Job Title within a Country (SQL Aggregated)
   * Answers: "What do Senior Engineers in India earn?"
   * Computes headcount, min, max, median, average, and P25/P75 percentiles
   */
  async getByDepartmentAndTitle(country?: string) {
    const cacheKey = `by_dept_title:${country ? country.trim().toLowerCase() : 'all'}`
    return this.getOrSet(cacheKey, async () => {
      const hasCountry = Boolean(country && country.trim())
      const sanitizedCountry = hasCountry ? country!.replace(/'/g, "''").trim() : ''
      const countryFilter = hasCountry ? `AND country = '${sanitizedCountry}'` : ''

      const raw = await prisma.$queryRawUnsafe<any[]>(`
        WITH RankedCohort AS (
          SELECT department, jobTitle, country, currency, baseSalary, baseSalaryUSD,
                 ROW_NUMBER() OVER (PARTITION BY country, department, jobTitle ORDER BY baseSalary) as rnk,
                 COUNT(*) OVER (PARTITION BY country, department, jobTitle) as cnt
          FROM employees
          WHERE status = 'ACTIVE' ${countryFilter}
        ),
        Percentiles AS (
          SELECT department, jobTitle, country,
                 AVG(CASE WHEN rnk IN ((cnt + 1) / 2, (cnt + 2) / 2) THEN baseSalary END) as medianSalary,
                 AVG(CASE WHEN rnk = MAX(1, (cnt * 25 + 50) / 100) THEN baseSalary END) as p25Salary,
                 AVG(CASE WHEN rnk = MAX(1, (cnt * 75 + 50) / 100) THEN baseSalary END) as p75Salary,
                 AVG(CASE WHEN rnk IN ((cnt + 1) / 2, (cnt + 2) / 2) THEN baseSalaryUSD END) as medianSalaryUSD
          FROM RankedCohort
          GROUP BY department, jobTitle, country
        ),
        Aggs AS (
          SELECT department, jobTitle, country, currency,
                 COUNT(*) as headcount,
                 ROUND(MIN(baseSalary), 2) as minSalary,
                 ROUND(MAX(baseSalary), 2) as maxSalary,
                 ROUND(AVG(baseSalary), 2) as avgSalary,
                 ROUND(MIN(baseSalaryUSD), 2) as minSalaryUSD,
                 ROUND(MAX(baseSalaryUSD), 2) as maxSalaryUSD,
                 ROUND(AVG(baseSalaryUSD), 2) as avgSalaryUSD
          FROM employees
          WHERE status = 'ACTIVE' ${countryFilter}
          GROUP BY department, jobTitle, country, currency
        )
        SELECT a.department, a.jobTitle, a.country, a.currency, a.headcount,
               a.minSalary, a.maxSalary, a.avgSalary,
               ROUND(COALESCE(p.medianSalary, a.avgSalary), 2) as medianSalary,
               ROUND(COALESCE(p.p25Salary, a.minSalary), 2) as p25Salary,
               ROUND(COALESCE(p.p75Salary, a.maxSalary), 2) as p75Salary,
               a.minSalaryUSD, a.maxSalaryUSD, a.avgSalaryUSD,
               ROUND(COALESCE(p.medianSalaryUSD, a.avgSalaryUSD), 2) as medianSalaryUSD
        FROM Aggs a
        JOIN Percentiles p ON a.department = p.department AND a.jobTitle = p.jobTitle AND a.country = p.country
        ORDER BY a.headcount DESC, a.department ASC, a.jobTitle ASC
      `)

      return raw.map((r) => ({
        department: String(r.department),
        jobTitle: String(r.jobTitle),
        country: String(r.country),
        currency: String(r.currency),
        headcount: toNum(r.headcount),
        minSalary: toNum(r.minSalary),
        maxSalary: toNum(r.maxSalary),
        avgSalary: toNum(r.avgSalary),
        medianSalary: toNum(r.medianSalary),
        p25Salary: toNum(r.p25Salary),
        p75Salary: toNum(r.p75Salary),
        minSalaryUSD: toNum(r.minSalaryUSD),
        maxSalaryUSD: toNum(r.maxSalaryUSD),
        avgSalaryUSD: toNum(r.avgSalaryUSD),
        medianSalaryUSD: toNum(r.medianSalaryUSD)
      }))
    })
  }

  /**
   * 4. Salary Distribution (Histogram & Percentiles in SQL)
   */
  async getSalaryDistribution(country?: string) {
    const cacheKey = `salary_dist:${country ? country.trim().toLowerCase() : 'all'}`
    return this.getOrSet(cacheKey, async () => {
      const hasCountry = Boolean(country && country.trim())
      const sanitizedCountry = hasCountry ? country!.replace(/'/g, "''").trim() : ''
      const countryFilter = hasCountry ? `AND country = '${sanitizedCountry}'` : ''

      // 4a. Distribution Histogram
      const histogramRaw = await prisma.$queryRawUnsafe<any[]>(`
        SELECT
          CASE
            WHEN baseSalaryUSD < 40000 THEN 'Under $40k'
            WHEN baseSalaryUSD < 60000 THEN '$40k - $60k'
            WHEN baseSalaryUSD < 80000 THEN '$60k - $80k'
            WHEN baseSalaryUSD < 100000 THEN '$80k - $100k'
            WHEN baseSalaryUSD < 125000 THEN '$100k - $125k'
            WHEN baseSalaryUSD < 150000 THEN '$125k - $150k'
            WHEN baseSalaryUSD < 175000 THEN '$150k - $175k'
            WHEN baseSalaryUSD < 200000 THEN '$175k - $200k'
            ELSE '$200k+'
          END as bandLabel,
          CASE
            WHEN baseSalaryUSD < 40000 THEN 1
            WHEN baseSalaryUSD < 60000 THEN 2
            WHEN baseSalaryUSD < 80000 THEN 3
            WHEN baseSalaryUSD < 100000 THEN 4
            WHEN baseSalaryUSD < 125000 THEN 5
            WHEN baseSalaryUSD < 150000 THEN 6
            WHEN baseSalaryUSD < 175000 THEN 7
            WHEN baseSalaryUSD < 200000 THEN 8
            ELSE 9
          END as sortOrder,
          COUNT(*) as count,
          ROUND(AVG(baseSalaryUSD), 0) as avgSalaryUSD,
          MIN(baseSalaryUSD) as minSalaryUSD,
          MAX(baseSalaryUSD) as maxSalaryUSD
        FROM employees
        WHERE status = 'ACTIVE' ${countryFilter}
        GROUP BY bandLabel, sortOrder
        ORDER BY sortOrder ASC
      `)

      // 4b. Percentile Bands (P10, P25, P50, P75, P90, P95)
      const percentilesRaw = await prisma.$queryRawUnsafe<any[]>(`
        WITH Ordered AS (
          SELECT baseSalaryUSD,
                 ROW_NUMBER() OVER (ORDER BY baseSalaryUSD) as rnk,
                 COUNT(*) OVER () as total_cnt
          FROM employees
          WHERE status = 'ACTIVE' ${countryFilter}
        )
        SELECT
          (SELECT baseSalaryUSD FROM Ordered WHERE rnk = MAX(1, CAST((total_cnt * 10) / 100 AS INT)) LIMIT 1) as p10,
          (SELECT baseSalaryUSD FROM Ordered WHERE rnk = MAX(1, CAST((total_cnt * 25) / 100 AS INT)) LIMIT 1) as p25,
          (SELECT baseSalaryUSD FROM Ordered WHERE rnk = MAX(1, CAST((total_cnt * 50) / 100 AS INT)) LIMIT 1) as p50,
          (SELECT baseSalaryUSD FROM Ordered WHERE rnk = MAX(1, CAST((total_cnt * 75) / 100 AS INT)) LIMIT 1) as p75,
          (SELECT baseSalaryUSD FROM Ordered WHERE rnk = MAX(1, CAST((total_cnt * 90) / 100 AS INT)) LIMIT 1) as p90,
          (SELECT baseSalaryUSD FROM Ordered WHERE rnk = MAX(1, CAST((total_cnt * 95) / 100 AS INT)) LIMIT 1) as p95
      `)

      const pRow = percentilesRaw[0] || {}

      return {
        histogram: histogramRaw.map((h) => ({
          bandLabel: String(h.bandLabel),
          count: toNum(h.count),
          avgSalaryUSD: toNum(h.avgSalaryUSD),
          minSalaryUSD: toNum(h.minSalaryUSD),
          maxSalaryUSD: toNum(h.maxSalaryUSD)
        })),
        percentiles: {
          p10: toNum(pRow.p10),
          p25: toNum(pRow.p25),
          p50: toNum(pRow.p50), // Median
          p75: toNum(pRow.p75),
          p90: toNum(pRow.p90),
          p95: toNum(pRow.p95)
        }
      }
    })
  }

  /**
   * 5. Outlier Detection in SQL
   * Identifies employees paid outside ±threshold% of the median for their title + country.
   * Directly actionable for HR to resolve pay disparities and retention risks.
   */
  async getOutliers(thresholdPercent = 20, limit = 50, country?: string) {
    const cacheKey = `outliers:${thresholdPercent}:${limit}:${country ? country.trim().toLowerCase() : 'all'}`
    return this.getOrSet(cacheKey, async () => {
      const thresholdFraction = Math.max(0.05, Math.min(0.5, thresholdPercent / 100))
      const hasCountry = Boolean(country && country.trim())
      const sanitizedCountry = hasCountry ? country!.replace(/'/g, "''").trim() : ''
      const countryFilter = hasCountry ? `AND e.country = '${sanitizedCountry}'` : ''

      // Detailed outliers list
      const itemsRaw = await prisma.$queryRawUnsafe<any[]>(`
        WITH CohortRanked AS (
          SELECT country, jobTitle, baseSalary,
                 ROW_NUMBER() OVER (PARTITION BY country, jobTitle ORDER BY baseSalary) as rnk,
                 COUNT(*) OVER (PARTITION BY country, jobTitle) as cnt
          FROM employees
          WHERE status = 'ACTIVE'
        ),
        CohortMedians AS (
          SELECT country, jobTitle, cnt,
                 AVG(baseSalary) as benchmarkMedian
          FROM CohortRanked
          WHERE rnk IN ((cnt + 1) / 2, (cnt + 2) / 2)
          GROUP BY country, jobTitle
        )
        SELECT e.id, e.employeeCode, e.firstName, e.lastName, e.email, e.department, e.jobTitle, e.country, e.currency,
               e.baseSalary, e.baseSalaryUSD,
               ROUND(m.benchmarkMedian, 2) as benchmarkMedian,
               ROUND(((e.baseSalary - m.benchmarkMedian) / m.benchmarkMedian) * 100, 1) as deviationPercent,
               CASE 
                 WHEN e.baseSalary < m.benchmarkMedian * (1 - ${thresholdFraction}) THEN 'BELOW_BAND'
                 WHEN e.baseSalary > m.benchmarkMedian * (1 + ${thresholdFraction}) THEN 'ABOVE_BAND'
                 ELSE 'IN_BAND'
               END as outlierStatus
        FROM employees e
        JOIN CohortMedians m ON e.country = m.country AND e.jobTitle = m.jobTitle
        WHERE e.status = 'ACTIVE' ${countryFilter}
          AND (
            e.baseSalary < m.benchmarkMedian * (1 - ${thresholdFraction}) OR 
            e.baseSalary > m.benchmarkMedian * (1 + ${thresholdFraction})
          )
        ORDER BY ABS((e.baseSalary - m.benchmarkMedian) / m.benchmarkMedian) DESC
        LIMIT ${Number(limit) || 50}
      `)

      // Counts summary
      const countRaw = await prisma.$queryRawUnsafe<any[]>(`
        WITH CohortRanked AS (
          SELECT country, jobTitle, baseSalary,
                 ROW_NUMBER() OVER (PARTITION BY country, jobTitle ORDER BY baseSalary) as rnk,
                 COUNT(*) OVER (PARTITION BY country, jobTitle) as cnt
          FROM employees
          WHERE status = 'ACTIVE'
        ),
        CohortMedians AS (
          SELECT country, jobTitle, cnt,
                 AVG(baseSalary) as benchmarkMedian
          FROM CohortRanked
          WHERE rnk IN ((cnt + 1) / 2, (cnt + 2) / 2)
          GROUP BY country, jobTitle
        )
        SELECT 
          COUNT(CASE WHEN e.baseSalary < m.benchmarkMedian * (1 - ${thresholdFraction}) THEN 1 END) as belowBandCount,
          COUNT(CASE WHEN e.baseSalary > m.benchmarkMedian * (1 + ${thresholdFraction}) THEN 1 END) as aboveBandCount,
          COUNT(*) as totalOutliers
        FROM employees e
        JOIN CohortMedians m ON e.country = m.country AND e.jobTitle = m.jobTitle
        WHERE e.status = 'ACTIVE' ${countryFilter}
          AND (
            e.baseSalary < m.benchmarkMedian * (1 - ${thresholdFraction}) OR 
            e.baseSalary > m.benchmarkMedian * (1 + ${thresholdFraction})
          )
      `)

      const cRow = countRaw[0] || {}

      return {
        thresholdPercent,
        summary: {
          totalOutliers: toNum(cRow.totalOutliers),
          belowBandCount: toNum(cRow.belowBandCount),
          aboveBandCount: toNum(cRow.aboveBandCount)
        },
        items: itemsRaw.map((item) => ({
          id: String(item.id),
          employeeCode: String(item.employeeCode || ''),
          name: `${item.firstName} ${item.lastName}`,
          email: String(item.email),
          department: String(item.department),
          jobTitle: String(item.jobTitle),
          country: String(item.country),
          currency: String(item.currency),
          baseSalary: toNum(item.baseSalary),
          baseSalaryUSD: toNum(item.baseSalaryUSD),
          benchmarkMedian: toNum(item.benchmarkMedian),
          deviationPercent: toNum(item.deviationPercent, 1),
          outlierStatus: item.outlierStatus as 'BELOW_BAND' | 'ABOVE_BAND'
        }))
      }
    })
  }

  /**
   * Unified Deep Dive Pay Insights (All in one fast payload)
   */
  async getDeepDivePayInsights(country?: string, thresholdPercent = 20) {
    const cacheKey = `deep_dive:${country ? country.trim().toLowerCase() : 'all'}:${thresholdPercent}`
    return this.getOrSet(cacheKey, async () => {
      const [overview, byCountry, byDepartmentTitle, distribution, outliers] = await Promise.all([
        this.getOrgOverview(),
        this.getByCountry(),
        this.getByDepartmentAndTitle(country),
        this.getSalaryDistribution(country),
        this.getOutliers(thresholdPercent, 50, country)
      ])

      return {
        overview,
        byCountry,
        byDepartmentTitle,
        distribution,
        outliers
      }
    })
  }
}

export const analyticsService = new AnalyticsService()
