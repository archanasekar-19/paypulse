import { prisma } from '../db/prisma'
import type { Prisma, Employee as DbEmployee } from '@prisma/client'

export interface GetEmployeesParams {
  page?: number
  limit?: number
  search?: string
  department?: string
  country?: string
  sortBy?: 'salary' | 'name' | 'department' | 'country' | 'hireDate'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateEmployeeInput {
  firstName: string
  lastName: string
  email: string
  department: string
  country: string
  jobTitle: string
  baseSalary: number
}

export interface UpdateEmployeeInput {
  firstName?: string
  lastName?: string
  email?: string
  department?: string
  country?: string
  jobTitle?: string
  baseSalary?: number
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
   * Fetches paginated, filtered, and sorted employee records directly from database
   */
  async getEmployees(params: GetEmployeesParams) {
    const page = Math.max(1, Number(params.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 25))
    const skip = (page - 1) * limit

    const { search, department, country, sortBy = 'salary', sortOrder = 'desc' } = params

    // Build Prisma WHERE filter condition
    const where: Prisma.EmployeeWhereInput = {}

    if (department && department !== 'ALL') {
      where.department = department
    }

    if (country && country !== 'ALL') {
      where.country = country
    }

    if (search && search.trim() !== '') {
      const query = search.trim()
      where.OR = [
        { firstName: { contains: query } },
        { lastName: { contains: query } },
        { email: { contains: query } },
        { jobTitle: { contains: query } }
      ]
    }

    let orderBy: Prisma.EmployeeOrderByWithRelationInput = { baseSalaryUSD: sortOrder }
    if (sortBy === 'name') {
      orderBy = { lastName: sortOrder }
    } else if (sortBy === 'department') {
      orderBy = { department: sortOrder }
    } else if (sortBy === 'country') {
      orderBy = { country: sortOrder }
    } else if (sortBy === 'hireDate') {
      orderBy = { hireDate: sortOrder }
    }

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
      currency: emp.currency,
      baseSalaryUSD: emp.baseSalaryUSD,
      hireDate: emp.hireDate.toISOString()
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
   * Creates a new employee record and computes normalized baseSalaryUSD
   */
  async createEmployee(input: CreateEmployeeInput) {
    const totalCount = await prisma.employee.count()
    const employeeCode = `ACM-${String(totalCount + 1).padStart(5, '0')}`

    const currency = COUNTRY_CURRENCY_MAP[input.country] || 'USD'
    const fxRate = FX_RATES_TO_USD[currency] || 1.0
    const baseSalaryUSD = Math.round(input.baseSalary * fxRate)

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
        hireDate: new Date()
      }
    })
  }

  /**
   * Updates full employee details and recalculates USD compensation
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

    return prisma.employee.update({
      where: { id },
      data: {
        firstName: input.firstName !== undefined ? input.firstName.trim() : undefined,
        lastName: input.lastName !== undefined ? input.lastName.trim() : undefined,
        email: input.email !== undefined ? input.email.trim().toLowerCase() : undefined,
        department: input.department ?? undefined,
        country: input.country ?? undefined,
        jobTitle: input.jobTitle !== undefined ? input.jobTitle.trim() : undefined,
        baseSalary,
        currency,
        baseSalaryUSD
      }
    })
  }

  /**
   * Updates an employee's salary and recalculates normalized USD amount
   */
  async updateSalary(id: string, newSalary: number) {
    const employee = await prisma.employee.findUnique({ where: { id } })
    if (!employee) {
      throw new Error('Employee not found')
    }

    const fxRate = FX_RATES_TO_USD[employee.currency] || 1.0
    const baseSalaryUSD = Math.round(newSalary * fxRate)

    return prisma.employee.update({
      where: { id },
      data: {
        baseSalary: newSalary,
        baseSalaryUSD
      }
    })
  }

  /**
   * Deletes an employee by ID
   */
  async deleteEmployee(id: string) {
    const employee = await prisma.employee.findUnique({ where: { id } })
    if (!employee) {
      throw new Error('Employee not found')
    }

    return prisma.employee.delete({
      where: { id }
    })
  }
}

export const employeeService = new EmployeeService()
