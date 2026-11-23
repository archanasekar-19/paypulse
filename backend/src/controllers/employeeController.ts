import type { Request, Response } from 'express'
import { employeeService } from '../services/employeeService'

export class EmployeeController {
  /**
   * GET /api/employees
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

  /**
   * POST /api/employees (Create Employee)
   */
  async createEmployee(req: Request, res: Response) {
    try {
      const {
        firstName,
        lastName,
        email,
        department,
        country,
        jobTitle,
        baseSalary,
        bonus,
        subsidy,
        allowance,
        overtimePay,
        insurance,
        leaveDeduction
      } = req.body

      if (!firstName || !lastName || !email || !department || !country || !jobTitle || !baseSalary) {
        return res.status(400).json({ error: 'All fields are required' })
      }

      if (typeof baseSalary !== 'number' || baseSalary <= 0) {
        return res.status(400).json({ error: 'Salary must be a positive number' })
      }

      const created = await employeeService.createEmployee({
        firstName,
        lastName,
        email,
        department,
        country,
        jobTitle,
        baseSalary,
        bonus,
        subsidy,
        allowance,
        overtimePay,
        insurance,
        leaveDeduction
      })

      return res.status(201).json({
        message: 'Employee created successfully',
        data: created
      })
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'An employee with this email already exists' })
      }
      console.error('Error creating employee:', error)
      return res.status(500).json({ error: 'Failed to create employee' })
    }
  }

  /**
   * PUT /api/employees/:id (Update Full Employee Details)
   */
  async updateEmployee(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0]! : (req.params.id as string)
      const {
        firstName,
        lastName,
        email,
        department,
        country,
        jobTitle,
        baseSalary,
        bonus,
        subsidy,
        allowance,
        overtimePay,
        insurance,
        leaveDeduction
      } = req.body

      if (baseSalary !== undefined && (typeof baseSalary !== 'number' || baseSalary <= 0)) {
        return res.status(400).json({ error: 'Salary must be a positive number' })
      }

      const updated = await employeeService.updateEmployee(id, {
        firstName,
        lastName,
        email,
        department,
        country,
        jobTitle,
        baseSalary,
        bonus,
        subsidy,
        allowance,
        overtimePay,
        insurance,
        leaveDeduction
      })

      return res.status(200).json({
        message: 'Employee updated successfully',
        data: updated
      })
    } catch (error: any) {
      if (error.message === 'Employee not found') {
        return res.status(404).json({ error: 'Employee not found' })
      }
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'An employee with this email already exists' })
      }
      console.error('Error updating employee:', error)
      return res.status(500).json({ error: 'Failed to update employee' })
    }
  }

  /**
   * PUT /api/employees/:id/salary (Update Salary)
   */
  async updateSalary(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0]! : (req.params.id as string)
      const { salary } = req.body

      if (typeof salary !== 'number' || salary <= 0) {
        return res.status(400).json({ error: 'Salary must be a positive number' })
      }

      const updated = await employeeService.updateSalary(id, salary)
      return res.status(200).json({
        message: 'Salary updated successfully',
        data: updated
      })
    } catch (error: any) {
      if (error.message === 'Employee not found') {
        return res.status(404).json({ error: 'Employee not found' })
      }
      console.error('Error updating salary:', error)
      return res.status(500).json({ error: 'Failed to update salary' })
    }
  }

  /**
   * DELETE /api/employees/:id (Delete Employee)
   */
  async deleteEmployee(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0]! : (req.params.id as string)

      await employeeService.deleteEmployee(id)
      return res.status(200).json({
        message: 'Employee deleted successfully'
      })
    } catch (error: any) {
      if (error.message === 'Employee not found') {
        return res.status(404).json({ error: 'Employee not found' })
      }
      console.error('Error deleting employee:', error)
      return res.status(500).json({ error: 'Failed to delete employee' })
    }
  }
}

export const employeeController = new EmployeeController()
