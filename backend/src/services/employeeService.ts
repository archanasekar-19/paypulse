import { prisma } from '../db/prisma'
import type { Prisma, Employee as DbEmployee } from '@prisma/client'

export interface GetEmployeesParams {
  page?: number
  limit?: number
  search?: string
  department?: string
  country?: string
  status?: string
  sortBy?: 'salary' | 'name' | 'department' | 'country' | 'hireDate' | 'netSalary' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface CustomSalaryItem {
  id: string
  name: string
  amount: number
}

export interface CreateEmployeeInput {
  employeeCode?: string
  firstName: string
  lastName: string
  email: string
  department: string
  country: string
  jobTitle: string
  baseSalary: number
  bonus?: number
  subsidy?: number
  allowance?: number
  overtimePay?: number
  earnedLeaves?: number
  leaveDays?: number
  insurance?: number
  leaveDeduction?: number
  customAdditions?: CustomSalaryItem[] | string
  customDeductions?: CustomSalaryItem[] | string
}

export interface UpdateEmployeeInput {
  employeeCode?: string
  firstName?: string
  lastName?: string
  email?: string
  department?: string
  country?: string
  jobTitle?: string
  baseSalary?: number
  bonus?: number
  subsidy?: number
  allowance?: number
  overtimePay?: number
  earnedLeaves?: number
  leaveDays?: number
  insurance?: number
  leaveDeduction?: number
  customAdditions?: CustomSalaryItem[] | string
  customDeductions?: CustomSalaryItem[] | string
}

// Exchange rates normalized to base USD
const FX_RATES_TO_USD: Record<string, number> = {
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.28,
  INR: 0.012,
  JPY: 0.0067,
  SGD: 0.75,
  CAD: 0.74
}

const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  'United States': 'USD',
  'United Kingdom': 'GBP',
  Germany: 'EUR',
  India: 'INR',
  Japan: 'JPY',
  Singapore: 'SGD',
  Canada: 'CAD'
}

export class EmployeeService {
  /**
   * Helper to build Prisma WHERE and ORDER BY filters for both pagination and CSV export
   */
  private buildFilterQuery(params: {
    search?: string
    department?: string
    country?: string
    status?: string
    sortBy?: 'salary' | 'name' | 'department' | 'country' | 'hireDate' | 'netSalary' | 'updatedAt'
    sortOrder?: 'asc' | 'desc'
  }) {
    const { search, department, country, status, sortBy = 'updatedAt', sortOrder = 'desc' } = params

    // Build Prisma WHERE filter condition
    const where: Prisma.EmployeeWhereInput = {}

    // Status filter: only filter if explicitly specified (e.g. ACTIVE or INACTIVE), otherwise return all records
    if (status && status !== 'ALL') {
      where.status = status
    }

    if (department && department !== 'ALL') {
      where.department = department
    }

    if (country && country !== 'ALL') {
      where.country = country
    }

    if (search && search.trim() !== '') {
      const query = search.trim()
      const searchConditions: Prisma.EmployeeWhereInput[] = [
        { employeeCode: { contains: query } },
        { firstName: { contains: query } },
        { lastName: { contains: query } },
        { email: { contains: query } },
        { jobTitle: { contains: query } }
      ]

      const parts = query.split(/\s+/).filter(Boolean)
      if (parts.length >= 2) {
        searchConditions.push({
          AND: [
            { firstName: { contains: parts[0] } },
            { lastName: { contains: parts.slice(1).join(' ') } }
          ]
        })
      }

      where.OR = searchConditions
    }

    let orderBy: Prisma.EmployeeOrderByWithRelationInput[] = [{ updatedAt: sortOrder }]
    if (sortBy === 'salary') {
      orderBy = [{ baseSalaryUSD: sortOrder }, { updatedAt: 'desc' }]
    } else if (sortBy === 'name') {
      orderBy = [{ lastName: sortOrder }, { firstName: sortOrder }, { updatedAt: 'desc' }]
    } else if (sortBy === 'department') {
      orderBy = [{ department: sortOrder }, { updatedAt: 'desc' }]
    } else if (sortBy === 'country') {
      orderBy = [{ country: sortOrder }, { updatedAt: 'desc' }]
    } else if (sortBy === 'hireDate') {
      orderBy = [{ hireDate: sortOrder }, { updatedAt: 'desc' }]
    } else if (sortBy === 'netSalary') {
      orderBy = [{ netSalaryUSD: sortOrder }, { updatedAt: 'desc' }]
    } else if (sortBy === 'updatedAt') {
      orderBy = [{ updatedAt: sortOrder }]
    }

    return { where, orderBy }
  }

  /**
   * Fetches paginated, filtered, and sorted employee records directly from database
   */
  async getEmployees(params: GetEmployeesParams) {
    const page = Math.max(1, Number(params.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 25))
    const skip = (page - 1) * limit

    const { where, orderBy } = this.buildFilterQuery(params)

    const [totalRecords, employees] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy
      })
    ])

    const totalPages = Math.ceil(totalRecords / limit)

    const data = employees.map((emp: DbEmployee) => ({
      id: emp.id,
      employeeCode: emp.employeeCode,
      name: `${emp.firstName} ${emp.lastName}`,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      department: emp.department,
      country: emp.country,
      jobTitle: emp.jobTitle,
      salary: emp.baseSalary,
      baseSalary: emp.baseSalary,
      bonus: emp.bonus,
      subsidy: emp.subsidy,
      allowance: emp.allowance,
      overtimePay: emp.overtimePay,
      grossSalary: emp.grossSalary,
      earnedLeaves: emp.earnedLeaves,
      leaveDays: emp.leaveDays,
      insurance: emp.insurance,
      leaveDeduction: emp.leaveDeduction,
      customAdditions: emp.customAdditions ? JSON.parse(emp.customAdditions) : [],
      customDeductions: emp.customDeductions ? JSON.parse(emp.customDeductions) : [],
      netSalary: emp.netSalary,
      netSalaryUSD: emp.netSalaryUSD,
      currency: emp.currency,
      baseSalaryUSD: emp.baseSalaryUSD,
      status: emp.status,
      deletedAt: emp.deletedAt ? emp.deletedAt.toISOString() : null,
      hireDate: emp.hireDate.toISOString(),
      updatedAt: emp.updatedAt.toISOString(),
      createdAt: emp.createdAt.toISOString()
    }))

    return {
      data,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  }

  /**
   * Creates a new employee record and computes normalized baseSalaryUSD, grossSalary, and netSalary
   */
  async createEmployee(input: CreateEmployeeInput) {
    const totalCount = await prisma.employee.count()
    const autoCode = `ACM-${String(totalCount + 1).padStart(5, '0')}`
    const employeeCode = input.employeeCode?.trim() ? input.employeeCode.trim() : autoCode

    const currency = COUNTRY_CURRENCY_MAP[input.country] || 'USD'
    const fxRate = FX_RATES_TO_USD[currency] || 1.0
    const baseSalaryUSD = Math.round(input.baseSalary * fxRate)

    // Welfare Salary Calculations
    const bonus = input.bonus ?? Math.round(input.baseSalary * 0.08)
    const subsidy = input.subsidy ?? Math.round(input.baseSalary * 0.03)
    const allowance = input.allowance ?? Math.round(input.baseSalary * 0.04)
    const overtimePay = input.overtimePay ?? 0
    const grossSalary = input.baseSalary + bonus + subsidy + allowance + overtimePay

    // Deductions of Wages
    const insurance = input.insurance ?? Math.round(input.baseSalary * 0.065)
    const earnedLeaves = input.earnedLeaves ?? 18
    const leaveDays = input.leaveDays ?? 0
    const unpaidDays = Math.max(0, leaveDays - earnedLeaves)
    const dailyWage = input.baseSalary / 260
    const leaveDeduction = input.leaveDeduction !== undefined ? input.leaveDeduction : Math.round(unpaidDays * dailyWage)

    // Net Salary
    const netSalary = grossSalary - (insurance + leaveDeduction)
    const netSalaryUSD = Math.round(netSalary * fxRate)

    return prisma.employee.create({
      data: {
        employeeCode,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email: input.email.trim().toLowerCase(),
        department: input.department,
        country: input.country,
        jobTitle: input.jobTitle.trim(),
        baseSalary: input.baseSalary,
        currency,
        baseSalaryUSD,
        bonus,
        subsidy,
        allowance,
        overtimePay,
        grossSalary,
        earnedLeaves,
        leaveDays,
        insurance,
        leaveDeduction,
        netSalary,
        netSalaryUSD,
        hireDate: new Date(),
        salaryHistory: {
          create: {
            oldAmount: 0,
            newAmount: input.baseSalary,
            currency,
            oldAmountUSD: 0,
            newAmountUSD: baseSalaryUSD,
            changePercent: 0,
            reason: (input as any).reason || 'Initial Contract Offer',
            changedBy: (input as any).changedBy || 'Archana Sekar (HR Manager)',
            effectiveDate: new Date(),
            notes: (input as any).notes || 'Initial onboarding compensation package.'
          }
        }
      }
    })
  }

  /**
   * Updates full employee details and recalculates USD compensation, gross, and net salary
   */
  async updateEmployee(id: string, input: UpdateEmployeeInput) {
    const employee = await prisma.employee.findUnique({ where: { id } })
    if (!employee) {
      throw new Error('Employee not found')
    }

    const country = input.country ?? employee.country
    const currency = COUNTRY_CURRENCY_MAP[country] || employee.currency
    const fxRate = FX_RATES_TO_USD[currency] || 1.0
    const baseSalary = input.baseSalary ?? employee.baseSalary
    const baseSalaryUSD = Math.round(baseSalary * fxRate)

    const bonus = input.bonus !== undefined ? input.bonus : employee.bonus
    const subsidy = input.subsidy !== undefined ? input.subsidy : employee.subsidy
    const allowance = input.allowance !== undefined ? input.allowance : employee.allowance
    const overtimePay = input.overtimePay !== undefined ? input.overtimePay : employee.overtimePay

    // Handle Custom Additions
    let customAdditions = employee.customAdditions
    let customAdditionsTotal = 0
    if (input.customAdditions !== undefined) {
      const parsedAdditions: CustomSalaryItem[] = typeof input.customAdditions === 'string'
        ? JSON.parse(input.customAdditions)
        : input.customAdditions
      customAdditions = JSON.stringify(parsedAdditions)
      customAdditionsTotal = parsedAdditions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
    } else if (employee.customAdditions) {
      try {
        const parsed = JSON.parse(employee.customAdditions)
        customAdditionsTotal = parsed.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0)
      } catch {
        customAdditionsTotal = 0
      }
    }

    const grossSalary = baseSalary + bonus + subsidy + allowance + overtimePay + customAdditionsTotal

    const insurance = input.insurance !== undefined ? input.insurance : employee.insurance
    const earnedLeaves = input.earnedLeaves !== undefined ? input.earnedLeaves : employee.earnedLeaves
    const leaveDays = input.leaveDays !== undefined ? input.leaveDays : employee.leaveDays
    const unpaidDays = Math.max(0, leaveDays - earnedLeaves)
    const dailyWage = baseSalary / 260
    const leaveDeduction = input.leaveDeduction !== undefined ? input.leaveDeduction : Math.round(unpaidDays * dailyWage)

    // Handle Custom Deductions
    let customDeductions = employee.customDeductions
    let customDeductionsTotal = 0
    if (input.customDeductions !== undefined) {
      const parsedDeductions: CustomSalaryItem[] = typeof input.customDeductions === 'string'
        ? JSON.parse(input.customDeductions)
        : input.customDeductions
      customDeductions = JSON.stringify(parsedDeductions)
      customDeductionsTotal = parsedDeductions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
    } else if (employee.customDeductions) {
      try {
        const parsed = JSON.parse(employee.customDeductions)
        customDeductionsTotal = parsed.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0)
      } catch {
        customDeductionsTotal = 0
      }
    }

    const netSalary = grossSalary - (insurance + leaveDeduction + customDeductionsTotal)
    const netSalaryUSD = Math.round(netSalary * fxRate)

    return prisma.employee.update({
      where: { id },
      data: {
        employeeCode: input.employeeCode !== undefined && input.employeeCode.trim() ? input.employeeCode.trim() : undefined,
        firstName: input.firstName !== undefined ? input.firstName.trim() : undefined,
        lastName: input.lastName !== undefined ? input.lastName.trim() : undefined,
        email: input.email !== undefined ? input.email.trim().toLowerCase() : undefined,
        department: input.department ?? undefined,
        country: input.country ?? undefined,
        jobTitle: input.jobTitle !== undefined ? input.jobTitle.trim() : undefined,
        baseSalary,
        currency,
        baseSalaryUSD,
        bonus,
        subsidy,
        allowance,
        overtimePay,
        grossSalary,
        earnedLeaves,
        leaveDays,
        insurance,
        leaveDeduction,
        customAdditions,
        customDeductions,
        netSalary,
        netSalaryUSD
      }
    })
  }

  /**
   * Updates an employee's salary and records an immutable SalaryHistory audit trail entry
   */
  async updateSalary(
    id: string,
    newSalary: number,
    options?: {
      reason?: string
      changedBy?: string
      effectiveDate?: string | Date
      notes?: string
    }
  ) {
    const employee = await prisma.employee.findUnique({ where: { id } })
    if (!employee) {
      throw new Error('Employee not found')
    }

    const fxRate = FX_RATES_TO_USD[employee.currency] || 1.0
    const oldSalary = employee.baseSalary
    const oldSalaryUSD = employee.baseSalaryUSD
    const baseSalary = newSalary
    const baseSalaryUSD = Math.round(baseSalary * fxRate)

    const grossSalary = baseSalary + employee.bonus + employee.subsidy + employee.allowance + employee.overtimePay
    const netSalary = grossSalary - (employee.insurance + employee.leaveDeduction)
    const netSalaryUSD = Math.round(netSalary * fxRate)

    const changePercent =
      oldSalary > 0
        ? Number((((baseSalary - oldSalary) / oldSalary) * 100).toFixed(1))
        : 0

    const reason =
      options?.reason ||
      (baseSalary > oldSalary
        ? 'Annual Merit & Performance Review'
        : 'Compensation Adjustment')
    const changedBy = options?.changedBy || 'Archana Sekar (HR Manager)'
    const effectiveDate = options?.effectiveDate
      ? new Date(options.effectiveDate)
      : new Date()
    const notes =
      options?.notes ||
      `Salary adjusted from ${employee.currency} ${oldSalary.toLocaleString()} to ${employee.currency} ${baseSalary.toLocaleString()}`

    const [updated] = await prisma.$transaction([
      prisma.employee.update({
        where: { id },
        data: {
          baseSalary,
          baseSalaryUSD,
          grossSalary,
          netSalary,
          netSalaryUSD
        }
      }),
      prisma.salaryHistory.create({
        data: {
          employeeId: id,
          oldAmount: oldSalary,
          newAmount: baseSalary,
          currency: employee.currency,
          oldAmountUSD: oldSalaryUSD,
          newAmountUSD: baseSalaryUSD,
          changePercent,
          reason,
          changedBy,
          effectiveDate,
          notes
        }
      })
    ])

    return updated
  }

  /**
   * Retrieves full chronological salary history timeline for an employee
   */
  async getSalaryHistory(employeeId: string) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        department: true,
        country: true,
        currency: true,
        baseSalary: true,
        baseSalaryUSD: true,
        hireDate: true
      }
    })

    if (!employee) {
      throw new Error('Employee not found')
    }

    const history = await prisma.salaryHistory.findMany({
      where: { employeeId },
      orderBy: { effectiveDate: 'desc' }
    })

    return {
      employee: {
        ...employee,
        name: `${employee.firstName} ${employee.lastName}`
      },
      history
    }
  }

  /**
   * Soft-deletes or restores an employee by updating their status (ACTIVE / INACTIVE)
   * and writing an immutable audit log entry to SalaryHistory to guarantee data integrity.
   */
  async updateEmployeeStatus(
    id: string,
    status: 'ACTIVE' | 'INACTIVE',
    reason?: string,
    changedBy?: string
  ) {
    const employee = await prisma.employee.findUnique({ where: { id } })
    if (!employee) {
      throw new Error('Employee not found')
    }

    const isDeactivating = status === 'INACTIVE'
    const auditReason = reason || (isDeactivating ? 'Employee Deactivated / Offboarded' : 'Employee Re-activated')
    const auditAuthor = changedBy || 'Archana Sekar (HR Manager)'
    const notes = isDeactivating
      ? (reason ? `Deactivated by ${auditAuthor}: ${reason}` : `Record marked INACTIVE via soft-delete by ${auditAuthor}`)
      : `Record re-activated by ${auditAuthor}`

    const [updated] = await prisma.$transaction([
      prisma.employee.update({
        where: { id },
        data: {
          status,
          deletedAt: isDeactivating ? new Date() : null
        }
      }),
      prisma.salaryHistory.create({
        data: {
          employeeId: id,
          oldAmount: employee.baseSalary,
          newAmount: employee.baseSalary,
          currency: employee.currency,
          oldAmountUSD: employee.baseSalaryUSD,
          newAmountUSD: employee.baseSalaryUSD,
          changePercent: 0,
          reason: auditReason,
          changedBy: auditAuthor,
          effectiveDate: new Date(),
          notes
        }
      })
    ])

    return updated
  }

  /**
   * Soft-deletes an employee by setting status = 'INACTIVE' and recording audit trail
   */
  async softDeleteEmployee(id: string, reason?: string, changedBy?: string) {
    return this.updateEmployeeStatus(id, 'INACTIVE', reason, changedBy)
  }

  /**
   * Legacy delete method: delegates to soft delete to prevent destructive data loss
   */
  async deleteEmployee(id: string, reason?: string) {
    return this.softDeleteEmployee(id, reason)
  }

  /**
   * Generates an RFC-4180 compliant CSV string of filtered employee payroll records
   */
  async exportEmployeesToCSV(params: {
    search?: string
    department?: string
    country?: string
    status?: string
    sortBy?: 'salary' | 'name' | 'department' | 'country' | 'hireDate' | 'netSalary' | 'updatedAt'
    sortOrder?: 'asc' | 'desc'
  }): Promise<string> {
    const { where, orderBy } = this.buildFilterQuery(params)

    const employees = await prisma.employee.findMany({
      where,
      orderBy
    })

    const headers = [
      'Employee Code',
      'First Name',
      'Last Name',
      'Email',
      'Department',
      'Country',
      'Job Title',
      'Status',
      'Currency',
      'Base Salary',
      'Bonus',
      'Subsidy',
      'Allowance',
      'Overtime Pay',
      'Gross Salary',
      'Earned Leaves',
      'Leave Days Taken',
      'Leave Deduction',
      'Insurance',
      'Net Take-Home Pay',
      'Net Salary (USD)'
    ]

    const escapeCSV = (val: unknown): string => {
      if (val === null || val === undefined) return ''
      const str = String(val)
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const rows = employees.map((emp) =>
      [
        escapeCSV(emp.employeeCode),
        escapeCSV(emp.firstName),
        escapeCSV(emp.lastName),
        escapeCSV(emp.email),
        escapeCSV(emp.department),
        escapeCSV(emp.country),
        escapeCSV(emp.jobTitle),
        escapeCSV(emp.status),
        escapeCSV(emp.currency),
        emp.baseSalary,
        emp.bonus,
        emp.subsidy,
        emp.allowance,
        emp.overtimePay,
        emp.grossSalary,
        emp.earnedLeaves,
        emp.leaveDays,
        emp.leaveDeduction,
        emp.insurance,
        emp.netSalary,
        emp.netSalaryUSD
      ].join(',')
    )

    return [headers.join(','), ...rows].join('\r\n')
  }
}

export const employeeService = new EmployeeService()
