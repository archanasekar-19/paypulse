import { Router } from 'express'
import { employeeController } from '../controllers/employeeController'

const router = Router()

// GET /api/employees - Server-side paginated, filtered, searched employee records
router.get('/', (req, res) => employeeController.getEmployees(req, res))

// GET /api/employees/export - Stream or download CSV of filtered employee payroll
router.get('/export', (req, res) => employeeController.exportEmployees(req, res))

// POST /api/employees - Create new employee
router.post('/', (req, res) => employeeController.createEmployee(req, res))

// PUT /api/employees/:id - Update full employee record
router.put('/:id', (req, res) => employeeController.updateEmployee(req, res))

// PUT /api/employees/:id/salary - Update employee compensation
router.put('/:id/salary', (req, res) => employeeController.updateSalary(req, res))

// GET /api/employees/:id/history - Get chronological salary revision timeline
router.get('/:id/history', (req, res) => employeeController.getSalaryHistory(req, res))

// POST /api/employees/:id/history - Record a new salary change event to timeline
router.post('/:id/history', (req, res) => employeeController.addSalaryRevision(req, res))

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', (req, res) => employeeController.deleteEmployee(req, res))

export default router
