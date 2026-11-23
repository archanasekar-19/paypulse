import { describe, it, expect } from 'vitest'
import { employeeService } from '../src/services/employeeService'
import { analyticsService } from '../src/services/analyticsService'

describe('EmployeeService & Server-Side Filtering (10,000 Employees)', () => {
  it('should return paginated results with default limit and pagination metadata', async () => {
    const result = await employeeService.getEmployees({ page: 1, limit: 10 })

    expect(result.data.length).toBe(10)
    expect(result.pagination.page).toBe(1)
    expect(result.pagination.limit).toBe(10)
    expect(result.pagination.totalRecords).toBe(10000)
    expect(result.pagination.totalPages).toBe(1000)
    expect(result.pagination.hasNextPage).toBe(true)
    expect(result.pagination.hasPrevPage).toBe(false)
  })

  it('should correctly filter employees by Department', async () => {
    const result = await employeeService.getEmployees({
      page: 1,
      limit: 15,
      department: 'Engineering'
    })

    expect(result.data.length).toBe(15)
    expect(result.data.every((emp) => emp.department === 'Engineering')).toBe(true)
    expect(result.pagination.totalRecords).toBeGreaterThan(3000) // ~35% of 10,000
  })

  it('should correctly filter employees by Country', async () => {
    const result = await employeeService.getEmployees({
      page: 1,
      limit: 10,
      country: 'India'
    })

    expect(result.data.length).toBe(10)
    expect(result.data.every((emp) => emp.country === 'India')).toBe(true)
    expect(result.data.every((emp) => emp.currency === 'INR')).toBe(true)
  })

  it('should sort employees by salary descending by default', async () => {
    const result = await employeeService.getEmployees({
      page: 1,
      limit: 5,
      sortBy: 'salary',
      sortOrder: 'desc'
    })

    expect(result.data.length).toBe(5)
    for (let i = 0; i < result.data.length - 1; i++) {
      expect(result.data[i]!.baseSalaryUSD).toBeGreaterThanOrEqual(result.data[i + 1]!.baseSalaryUSD)
    }
  })

  it('should search employees by sub-string in name or email', async () => {
    const result = await employeeService.getEmployees({
      page: 1,
      limit: 10,
      search: 'Sarah'
    })

    expect(result.data.length).toBeGreaterThan(0)
    expect(
      result.data.every(
        (emp) =>
          emp.name.toLowerCase().includes('sarah') ||
          emp.email.toLowerCase().includes('sarah')
      )
    ).toBe(true)
  })
})

describe('AnalyticsService (Macro KPIs over 10,000 Records)', () => {
  it('should calculate global metrics including median salary', async () => {
    const summary = await analyticsService.getSummaryMetrics()

    expect(summary.totalEmployees).toBe(10000)
    expect(summary.totalPayrollUSD).toBeGreaterThan(500_000_000)
    expect(summary.averageSalaryUSD).toBeGreaterThan(50_000)
    expect(summary.medianSalaryUSD).toBeGreaterThan(50_000)
    expect(summary.departmentBreakdown.length).toBeGreaterThan(0)
    expect(summary.countryBreakdown.length).toBe(7)
  })
})
