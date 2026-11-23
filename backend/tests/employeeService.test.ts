import { describe, it, expect } from 'vitest'
import { employeeService } from '../src/services/employeeService'
import { analyticsService } from '../src/services/analyticsService'

describe('EmployeeService & Server-Side Filtering (10,000 Employees)', () => {
  it('should return paginated results with default limit and pagination metadata', async () => {
    const result = await employeeService.getEmployees({ page: 1, limit: 10 })

    expect(result.data.length).toBe(10)
    expect(result.pagination.page).toBe(1)
    expect(result.pagination.limit).toBe(10)
    expect(result.pagination.totalRecords).toBeGreaterThanOrEqual(10000)
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

  it('should support full CRUD operations (Create, Read, Update, Delete)', async () => {
    // 1. Create
    const uniqueEmail = `test.artisan.${Date.now()}@acme.com`
    const created = await employeeService.createEmployee({
      firstName: 'Alan',
      lastName: 'Turing',
      email: uniqueEmail,
      department: 'Engineering',
      country: 'United Kingdom',
      jobTitle: 'Cryptography Pioneer',
      baseSalary: 120000
    })

    expect(created.id).toBeDefined()
    expect(created.employeeCode).toBeDefined()
    expect(created.currency).toBe('GBP')
    expect(created.baseSalaryUSD).toBe(Math.round(120000 * 1.28))

    // 2. Update Salary
    const updatedSalary = await employeeService.updateSalary(created.id, 135000)
    expect(updatedSalary.baseSalary).toBe(135000)
    expect(updatedSalary.baseSalaryUSD).toBe(Math.round(135000 * 1.28))

    // 3. Full Update Employee
    const updatedRecord = await employeeService.updateEmployee(created.id, {
      jobTitle: 'Chief Cryptanalyst',
      baseSalary: 150000,
      department: 'Operations'
    })
    expect(updatedRecord.jobTitle).toBe('Chief Cryptanalyst')
    expect(updatedRecord.department).toBe('Operations')
    expect(updatedRecord.baseSalary).toBe(150000)
    expect(updatedRecord.baseSalaryUSD).toBe(Math.round(150000 * 1.28))

    // 4. Delete
    await employeeService.deleteEmployee(created.id)
    await expect(employeeService.deleteEmployee(created.id)).rejects.toThrow('Employee not found')
  })
})

describe('AnalyticsService (Macro KPIs over 10,000 Records)', () => {
  it('should calculate global metrics including median salary', async () => {
    const summary = await analyticsService.getSummaryMetrics()

    expect(summary.totalEmployees).toBeGreaterThanOrEqual(10000)
    expect(summary.totalPayrollUSD).toBeGreaterThan(500_000_000)
    expect(summary.averageSalaryUSD).toBeGreaterThan(50_000)
    expect(summary.medianSalaryUSD).toBeGreaterThan(50_000)
    expect(summary.departmentBreakdown.length).toBeGreaterThan(0)
    expect(summary.countryBreakdown.length).toBe(7)
  })
})
