import { describe, it, expect } from 'vitest'
import { analyticsService } from '../src/services/analyticsService'
import { employeeService } from '../src/services/employeeService'
import { prisma } from '../src/db/prisma'

describe('Deep Dive Pay Insights SQL Aggregations', () => {
  it('should compute Org Overview directly in SQL with median & average', async () => {
    const overview = await analyticsService.getOrgOverview()

    expect(overview.headcount).toBeGreaterThanOrEqual(1000)
    expect(overview.totalPayrollUSD).toBeGreaterThan(0)
    expect(overview.medianSalaryUSD).toBeGreaterThan(0)
    expect(overview.avgSalaryUSD).toBeGreaterThan(0)
    expect(overview.minSalaryUSD).toBeLessThanOrEqual(overview.medianSalaryUSD)
    expect(overview.maxSalaryUSD).toBeGreaterThanOrEqual(overview.medianSalaryUSD)
  })

  it('should compute By Country statistics with min, max, median, average, and cost', async () => {
    const countries = await analyticsService.getByCountry()

    expect(countries.length).toBeGreaterThan(0)
    const india = countries.find((c) => c.country === 'India')
    expect(india).toBeDefined()
    expect(india!.currency).toBe('INR')
    expect(india!.headcount).toBeGreaterThan(0)
    expect(india!.medianSalaryLocal).toBeGreaterThan(0)
    expect(india!.avgSalaryLocal).toBeGreaterThan(0)
    expect(india!.totalCostUSD).toBeGreaterThan(0)
  })

  it('should answer "What do Senior Engineers in India earn?" with department, title & percentiles', async () => {
    const indiaRoles = await analyticsService.getByDepartmentAndTitle('India')

    expect(indiaRoles.length).toBeGreaterThan(0)
    expect(indiaRoles.every((r) => r.country === 'India')).toBe(true)

    const seniorEng = indiaRoles.find((r) => r.jobTitle.toLowerCase().includes('engineer'))
    expect(seniorEng).toBeDefined()
    expect(seniorEng!.medianSalary).toBeGreaterThan(0)
    expect(seniorEng!.p25Salary).toBeLessThanOrEqual(seniorEng!.medianSalary)
    expect(seniorEng!.p75Salary).toBeGreaterThanOrEqual(seniorEng!.medianSalary)
    expect(seniorEng!.headcount).toBeGreaterThan(0)
  })

  it('should compute salary distribution histogram and percentile bands in SQL', async () => {
    const dist = await analyticsService.getSalaryDistribution()

    expect(dist.histogram.length).toBeGreaterThan(0)
    expect(dist.histogram.some((h) => h.count > 0)).toBe(true)

    expect(dist.percentiles.p10).toBeGreaterThan(0)
    expect(dist.percentiles.p25).toBeGreaterThanOrEqual(dist.percentiles.p10)
    expect(dist.percentiles.p50).toBeGreaterThanOrEqual(dist.percentiles.p25)
    expect(dist.percentiles.p75).toBeGreaterThanOrEqual(dist.percentiles.p50)
    expect(dist.percentiles.p90).toBeGreaterThanOrEqual(dist.percentiles.p75)
  })

  it('should detect salary outliers outside ±20% of title + country median benchmark', async () => {
    const outliers = await analyticsService.getOutliers(20, 30)

    expect(outliers.thresholdPercent).toBe(20)
    expect(outliers.summary.totalOutliers).toBeGreaterThanOrEqual(0)
    if (outliers.items.length > 0) {
      const first = outliers.items[0]
      expect(first.benchmarkMedian).toBeGreaterThan(0)
      expect(Math.abs(first.deviationPercent)).toBeGreaterThanOrEqual(20)
      expect(['BELOW_BAND', 'ABOVE_BAND']).toContain(first.outlierStatus)
    }
  })
})

describe('In-Memory Analytics Caching & Mutation Invalidation', () => {
  it('should cache getDeepDivePayInsights results and serve instantaneous cache hits', async () => {
    analyticsService.clearCache()
    expect(analyticsService.getCacheStats().size).toBe(0)

    // First call (cache miss -> computes SQL queries)
    const res1 = await analyticsService.getDeepDivePayInsights()
    const statsAfterMiss = analyticsService.getCacheStats()
    expect(statsAfterMiss.size).toBeGreaterThan(0)
    expect(statsAfterMiss.keys).toContain('deep_dive:all:20')

    // Second call (cache hit -> instantaneous memory return)
    const t0 = performance.now()
    const res2 = await analyticsService.getDeepDivePayInsights()
    const durationMs = performance.now() - t0

    expect(res2).toEqual(res1)
    expect(durationMs).toBeLessThan(25)

    analyticsService.clearCache()
    expect(analyticsService.getCacheStats().size).toBe(0)
  })

  it('should invalidate cache when salary is updated or employee status changes', async () => {
    analyticsService.clearCache()
    await analyticsService.getOrgOverview()
    expect(analyticsService.getCacheStats().size).toBeGreaterThan(0)

    // Create a temporary employee fixture
    const fixture = await employeeService.createEmployee({
      firstName: 'CacheInvalidation',
      lastName: 'Fixture',
      email: `cache.fixture.${Date.now()}@paypulse.test`,
      department: 'Engineering',
      country: 'United States',
      jobTitle: 'QA Lead',
      baseSalary: 115000
    })

    // createEmployee must have cleared cache
    expect(analyticsService.getCacheStats().size).toBe(0)

    // Repopulate cache
    await analyticsService.getOrgOverview()
    expect(analyticsService.getCacheStats().size).toBeGreaterThan(0)

    // updateSalary must also clear cache
    await employeeService.updateSalary(fixture.id, 125000, { reason: 'Cache test revision' })
    expect(analyticsService.getCacheStats().size).toBe(0)

    // Repopulate cache
    await analyticsService.getOrgOverview()
    expect(analyticsService.getCacheStats().size).toBeGreaterThan(0)

    // softDeleteEmployee must also clear cache
    await employeeService.softDeleteEmployee(fixture.id, 'Cache test deactivation')
    expect(analyticsService.getCacheStats().size).toBe(0)

    // Hard delete fixture to keep dev.db pristine at 10,000 active records
    await prisma.employee.delete({ where: { id: fixture.id } })
    analyticsService.clearCache()
  })
})
