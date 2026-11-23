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

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    totalRecords: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
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

    // Department Filter
    if (department && department !== 'ALL') {
      where.department = department
    }

    // Country Filter
    if (country && country !== 'ALL') {
      where.country = country
    }

    // Sub-string search across name, email, and job title
    if (search && search.trim() !== '') {
      const query = search.trim()
      where.OR = [
        { firstName: { contains: query } },
        { lastName: { contains: query } },
        { email: { contains: query } },
        { jobTitle: { contains: query } }
      ]
    }

    // Sort mapping
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

    // Execute queries in parallel using transactional indexing
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

    // Map database fields to clean API response model
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
}

export const employeeService = new EmployeeService()
