import { Router } from 'express'
import { employeeController } from '../controllers/employeeController'

const router = Router()

// GET /api/employees - Server-side paginated, filtered, searched employee records
router.get('/', (req, res) => employeeController.getEmployees(req, res))

export default router
