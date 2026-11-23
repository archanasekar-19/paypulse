import type { Request, Response } from 'express'
import { employeeService } from '../services/employeeService'

export class EmployeeController {
  /**
   * GET /api/employees
   * Query params: page, limit, search, department, country, sortBy, sortOrder
   */
  async getEmployees(req: Request, res: Response) {
    try {
      const { page, limit, search, department, country, sortBy, sortOrder } = req.query

      const result = await employeeService.getEmployees({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search ? String(search) : undefined,
        department: department ? String(department) : undefined,
        country: country ? String(country) : undefined,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any
      })

      return res.status(200).json(result)
    } catch (error) {
      console.error('Error fetching employees:', error)
      return res.status(500).json({ error: 'Failed to fetch employees' })
    }
  }
}

export const employeeController = new EmployeeController()
