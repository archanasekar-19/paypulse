import type { Request, Response } from 'express'
import { employeeService } from '../services/employeeService'

export class EmployeeController {
  /**
   * GET /api/employees
   */
  async getEmployees(req: Request, res: Response) {
    try {
      const { page, limit, search, department, country, status, sortBy, sortOrder } = req.query

      const result = await employeeService.getEmployees({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search ? String(search) : undefined,
        department: department ? String(department) : undefined,
        country: country ? String(country) : undefined,
        status: status ? String(status) : undefined,
        sortBy: (sortBy as any) || 'updatedAt',
        sortOrder: (sortOrder as any) || 'desc'
      })

      return res.status(200).json(result)
    } catch (error) {
      console.error('Error fetching employees:', error)
      return res.status(500).json({ error: 'Failed to fetch employees' })
    }
  }

  /**
   * GET /api/employees/export (Export CSV of filtered employees)
   */
  async exportEmployees(req: Request, res: Response) {
    try {
      const { search, department, country, status, sortBy, sortOrder } = req.query

      const csvContent = await employeeService.exportEmployeesToCSV({
        search: search ? String(search) : undefined,
        department: department ? String(department) : undefined,
        country: country ? String(country) : undefined,
        status: status ? String(status) : undefined,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any
      })

      const dateStr = new Date().toISOString().slice(0, 10)
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="paypulse_payroll_${dateStr}.csv"`)
      return res.status(200).send(csvContent)
    } catch (error) {
      console.error('Error exporting payroll to CSV:', error)
      return res.status(500).json({ error: 'Failed to export payroll records to CSV' })
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
        earnedLeaves,
        leaveDays,
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
        earnedLeaves,
        leaveDays,
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
        earnedLeaves,
        leaveDays,
        insurance,
        leaveDeduction,
        customAdditions,
        customDeductions
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
        earnedLeaves,
        leaveDays,
        insurance,
        leaveDeduction,
        customAdditions,
        customDeductions
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
   * PUT /api/employees/:id/salary (Update Salary with Audit Trail)
   */
  async updateSalary(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0]! : (req.params.id as string)
      const { salary, reason, changedBy, effectiveDate, notes } = req.body

      if (typeof salary !== 'number' || salary <= 0) {
        return res.status(400).json({ error: 'Salary must be a positive number' })
      }

      const updated = await employeeService.updateSalary(id, salary, {
        reason,
        changedBy,
        effectiveDate,
        notes
      })
      return res.status(200).json({
        message: 'Salary updated and audit trail recorded successfully',
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
   * GET /api/employees/:id/history (Get Chronological Salary Revision Timeline)
   */
  async getSalaryHistory(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0]! : (req.params.id as string)
      const result = await employeeService.getSalaryHistory(id)
      return res.status(200).json(result)
    } catch (error: any) {
      if (error.message === 'Employee not found') {
        return res.status(404).json({ error: 'Employee not found' })
      }
      console.error('Error fetching salary history:', error)
      return res.status(500).json({ error: 'Failed to fetch salary history timeline' })
    }
  }

  /**
   * POST /api/employees/:id/history (Add New Salary Revision to Timeline)
   */
  async addSalaryRevision(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0]! : (req.params.id as string)
      const { newSalary, reason, changedBy, effectiveDate, notes } = req.body

      if (typeof newSalary !== 'number' || newSalary <= 0) {
        return res.status(400).json({ error: 'New salary amount must be a positive number' })
      }
      if (!reason || typeof reason !== 'string' || reason.trim() === '') {
        return res.status(400).json({ error: 'A revision reason is required (e.g. Promotion, Annual Review)' })
      }

      const updated = await employeeService.updateSalary(id, newSalary, {
        reason: reason.trim(),
        changedBy: changedBy || 'Archana Sekar (HR Manager)',
        effectiveDate,
        notes
      })

      const history = await employeeService.getSalaryHistory(id)

      return res.status(201).json({
        message: 'Salary revision recorded in timeline successfully',
        data: updated,
        history: history.history
      })
    } catch (error: any) {
      if (error.message === 'Employee not found') {
        return res.status(404).json({ error: 'Employee not found' })
      }
      console.error('Error adding salary revision:', error)
      return res.status(500).json({ error: 'Failed to record salary revision' })
    }
  }

  /**
   * PATCH /api/employees/:id/status (Soft delete / Deactivate or Re-activate Employee)
   */
  async updateEmployeeStatus(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0]! : (req.params.id as string)
      const { status = 'INACTIVE', reason, changedBy } = req.body

      if (status !== 'ACTIVE' && status !== 'INACTIVE') {
        return res.status(400).json({ error: 'Status must be ACTIVE or INACTIVE' })
      }

      const updated = await employeeService.updateEmployeeStatus(
        id,
        status,
        reason,
        changedBy || 'Archana Sekar (HR Manager)'
      )

      return res.status(200).json({
        message: status === 'INACTIVE'
          ? 'Employee successfully deactivated (soft-deleted) and archived in audit log'
          : 'Employee successfully re-activated',
        data: updated
      })
    } catch (error: any) {
      if (error.message === 'Employee not found') {
        return res.status(404).json({ error: 'Employee not found' })
      }
      console.error('Error updating employee status:', error)
      return res.status(500).json({ error: 'Failed to update employee status' })
    }
  }

  /**
   * DELETE /api/employees/:id
   * Hard DELETE is disabled by design to protect compliance, salary history, and audit trails.
   */
  async deleteEmployee(req: Request, res: Response) {
    return res.status(405).json({
      error: 'Direct DELETE method is not permitted to preserve historical payroll and audit trail compliance. Use PATCH /api/employees/:id/status with { status: "INACTIVE" } for soft deactivation.'
    })
  }
}

export const employeeController = new EmployeeController()
