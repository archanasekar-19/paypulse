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
    expect(created.grossSalary).toBeGreaterThan(120000)
    expect(created.netSalary).toBe(created.grossSalary - (created.insurance + created.leaveDeduction))
    expect(created.netSalaryUSD).toBe(Math.round(created.netSalary * 1.28))

    // 2. Update Salary with Audit Trail Reason
    const updatedSalary = await employeeService.updateSalary(created.id, 135000, {
      reason: 'Promotion to Senior Fellow',
      changedBy: 'Archana Sekar (HR Manager)',
      notes: 'Outstanding contribution to cryptography research.'
    })
    expect(updatedSalary.baseSalary).toBe(135000)
    expect(updatedSalary.baseSalaryUSD).toBe(Math.round(135000 * 1.28))
    expect(updatedSalary.grossSalary).toBeGreaterThan(135000)
    expect(updatedSalary.netSalary).toBe(updatedSalary.grossSalary - (updatedSalary.insurance + updatedSalary.leaveDeduction))

    // 2b. Verify Immutable Salary History Audit Trail
    const historyData = await employeeService.getSalaryHistory(created.id)
    expect(historyData.history.length).toBe(2)
    // Latest entry
    expect(historyData.history[0]?.newAmount).toBe(135000)
    expect(historyData.history[0]?.oldAmount).toBe(120000)
    expect(historyData.history[0]?.reason).toBe('Promotion to Senior Fellow')
    expect(historyData.history[0]?.changedBy).toBe('Archana Sekar (HR Manager)')
    expect(historyData.history[0]?.changePercent).toBe(12.5) // (135k - 120k) / 120k = +12.5%
    // Initial entry
    expect(historyData.history[1]?.newAmount).toBe(120000)
    expect(historyData.history[1]?.oldAmount).toBe(0)
    expect(historyData.history[1]?.reason).toBe('Initial Contract Offer')

    // 3. Full Update Employee with Custom Welfare & Deductions
    const updatedRecord = await employeeService.updateEmployee(created.id, {
      jobTitle: 'Chief Cryptanalyst',
      baseSalary: 150000,
      department: 'Operations',
      bonus: 15000,
      subsidy: 4500,
      allowance: 6000,
      overtimePay: 2000,
      insurance: 9750,
      leaveDeduction: 500
    })
    expect(updatedRecord.jobTitle).toBe('Chief Cryptanalyst')
    expect(updatedRecord.department).toBe('Operations')
    expect(updatedRecord.baseSalary).toBe(150000)
    expect(updatedRecord.bonus).toBe(15000)
    expect(updatedRecord.subsidy).toBe(4500)
    expect(updatedRecord.allowance).toBe(6000)
    expect(updatedRecord.overtimePay).toBe(2000)
    expect(updatedRecord.grossSalary).toBe(150000 + 15000 + 4500 + 6000 + 2000) // 177500
    expect(updatedRecord.insurance).toBe(9750)
    expect(updatedRecord.leaveDeduction).toBe(500)
    expect(updatedRecord.netSalary).toBe(177500 - (9750 + 500)) // 167250
    expect(updatedRecord.netSalaryUSD).toBe(Math.round(167250 * 1.28))

    // 4. Soft Delete (Deactivate to INACTIVE status with audit record)
    const softDeleted = await employeeService.softDeleteEmployee(created.id, 'Offboarding Alan Turing')
    expect(softDeleted.status).toBe('INACTIVE')
    expect(softDeleted.deletedAt).not.toBeNull()

    // 4b. Verify excluded from active employee queries by default
    const activeSearch = await employeeService.getEmployees({ search: uniqueEmail })
    expect(activeSearch.data.length).toBe(0)

    // 4c. Verify retrievable when explicitly querying INACTIVE or ALL
    const inactiveSearch = await employeeService.getEmployees({ search: uniqueEmail, status: 'INACTIVE' })
    expect(inactiveSearch.data.length).toBe(1)
    expect(inactiveSearch.data[0]?.status).toBe('INACTIVE')
    expect(inactiveSearch.data[0]?.email).toBe(uniqueEmail)

    // 4d. Verify SalaryHistory preserves complete audit trail including offboarding
    const historyAfterSoftDelete = await employeeService.getSalaryHistory(created.id)
    expect(historyAfterSoftDelete.history.length).toBe(3)
    expect(historyAfterSoftDelete.history[0]?.reason).toBe('Offboarding Alan Turing')
    expect(historyAfterSoftDelete.history[0]?.changedBy).toBe('Archana Sekar (HR Manager)')

    // 4e. Verify Re-activation works seamlessly via updateEmployeeStatus
    const reactivated = await employeeService.updateEmployeeStatus(created.id, 'ACTIVE')
    expect(reactivated.status).toBe('ACTIVE')
    expect(reactivated.deletedAt).toBeNull()

    const activeAgain = await employeeService.getEmployees({ search: uniqueEmail })
    expect(activeAgain.data.length).toBe(1)
    expect(activeAgain.data[0]?.status).toBe('ACTIVE')

    // Soft delete once more for test cleanup
    await employeeService.softDeleteEmployee(created.id, 'Test completion')
  })

  it('should always show the latest updated employee at the top by default using updatedAt desc', async () => {
    // 1. Fetch current top employee
    const initialList = await employeeService.getEmployees({ page: 1, limit: 10 })

    // 2. Create a new employee
    const testEmployee = await employeeService.createEmployee({
      firstName: 'Latest',
      lastName: 'Pioneer',
      email: `latest.pioneer.${Date.now()}@acme.com`,
      department: 'Engineering',
      country: 'United States',
      jobTitle: 'Senior Systems Engineer',
      baseSalary: 140000
    })

    // Immediately after creation, this newly created employee must be at the very top (index 0)
    const afterCreate = await employeeService.getEmployees({ page: 1, limit: 10 })
    expect(afterCreate.data[0]?.id).toBe(testEmployee.id)
    expect(afterCreate.data[0]?.email).toBe(testEmployee.email)

    // 3. Now pick another employee and update their salary
    const secondEmp = initialList.data[5] || initialList.data[1]
    if (secondEmp) {
      await employeeService.updateSalary(secondEmp.id, secondEmp.salary + 5000, {
        reason: 'Merit Raise Test',
        changedBy: 'Archana Sekar (HR Manager)'
      })

      // The updated employee must now be at the very top (index 0)
      const afterUpdate = await employeeService.getEmployees({ page: 1, limit: 10 })
      expect(afterUpdate.data[0]?.id).toBe(secondEmp.id)
    }

    // Clean up
    await employeeService.softDeleteEmployee(testEmployee.id, 'Test cleanup')
  })

  it('should export filtered employee payroll records into RFC-4180 CSV format', async () => {
    const csvData = await employeeService.exportEmployeesToCSV({
      department: 'Engineering',
      country: 'India'
    })

    expect(typeof csvData).toBe('string')
    const lines = csvData.split('\r\n')
    expect(lines.length).toBeGreaterThan(10)

    // Verify CSV Header Row
    const header = lines[0]
    expect(header).toContain('Employee Code')
    expect(header).toContain('Gross Salary')
    expect(header).toContain('Leave Deduction')
    expect(header).toContain('Net Take-Home Pay')
    expect(header).toContain('Net Salary (USD)')

    // Verify first data line has correct currency and department
    const firstRow = lines[1]
    expect(firstRow).toContain('Engineering')
    expect(firstRow).toContain('India')
    expect(firstRow).toContain('INR')
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

  it('should strictly exclude soft-deleted/INACTIVE employees from active headcount and macro KPIs', async () => {
    // 1. Snapshot active count
    const initialSummary = await analyticsService.getSummaryMetrics()

    // 2. Create a temporary employee
    const tempEmp = await employeeService.createEmployee({
      firstName: 'Temporary',
      lastName: 'Contractor',
      email: `temp.contractor.${Date.now()}@acme.com`,
      department: 'Finance',
      country: 'United States',
      jobTitle: 'Financial Analyst',
      baseSalary: 100000
    })

    const afterCreateSummary = await analyticsService.getSummaryMetrics()
    expect(afterCreateSummary.totalEmployees).toBe(initialSummary.totalEmployees + 1)
    expect(afterCreateSummary.totalPayrollUSD).toBe(initialSummary.totalPayrollUSD + 100000)

    // 3. Soft-delete the temporary employee
    await employeeService.softDeleteEmployee(tempEmp.id, 'Project contract ended')

    // 4. Verify headcount and payroll revert back to initial active totals
    const afterDeleteSummary = await analyticsService.getSummaryMetrics()
    expect(afterDeleteSummary.totalEmployees).toBe(initialSummary.totalEmployees)
    expect(afterDeleteSummary.totalPayrollUSD).toBe(initialSummary.totalPayrollUSD)
  })
})
