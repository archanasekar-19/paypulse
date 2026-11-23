import { prisma } from '../db/prisma'

export class AnalyticsService {
  /**
   * Calculates company-wide compensation KPIs directly in SQL using B-Tree indexes
   */
  async getSummaryMetrics() {
    const whereActive = { status: 'ACTIVE' }

    const totalEmployees = await prisma.employee.count({ where: whereActive })
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

    // 1. Total & Average USD Payroll using DB aggregate
    const aggregate = await prisma.employee.aggregate({
      where: whereActive,
      _sum: { baseSalaryUSD: true },
      _avg: { baseSalaryUSD: true }
    })

    const totalPayrollUSD = Math.round(aggregate._sum.baseSalaryUSD || 0)
    const averageSalaryUSD = Math.round(aggregate._avg.baseSalaryUSD || 0)

    // 2. Exact Median Salary Calculation (O(log N) lookup using index on baseSalaryUSD)
    const middleOffset = Math.floor(totalEmployees / 2)
    const medianRecord = await prisma.employee.findFirst({
      where: whereActive,
      skip: middleOffset,
      orderBy: { baseSalaryUSD: 'asc' },
      select: { baseSalaryUSD: true }
    })
    const medianSalaryUSD = medianRecord ? Math.round(medianRecord.baseSalaryUSD) : 0

    // 3. Department Breakdown (Headcount & Total Spend)
    const deptGroups = await prisma.employee.groupBy({
      by: ['department'],
      where: whereActive,
      _count: { _all: true },
      _sum: { baseSalaryUSD: true },
      _avg: { baseSalaryUSD: true }
    })

    const departmentBreakdown = deptGroups.map((group: { department: string; _count: { _all: number }; _sum: { baseSalaryUSD: number | null }; _avg: { baseSalaryUSD: number | null } }) => ({
      department: group.department,
      headcount: group._count._all,
      totalSpendUSD: Math.round(group._sum.baseSalaryUSD || 0),
      averageSalaryUSD: Math.round(group._avg.baseSalaryUSD || 0)
    }))

    // 4. Country Breakdown
    const countryGroups = await prisma.employee.groupBy({
      by: ['country', 'currency'],
      where: whereActive,
      _count: { _all: true },
      _sum: { baseSalaryUSD: true }
    })

    const countryBreakdown = countryGroups.map((group: { country: string; currency: string; _count: { _all: number }; _sum: { baseSalaryUSD: number | null } }) => ({
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
  }
}

export const analyticsService = new AnalyticsService()
