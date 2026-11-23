import { Router } from 'express'
import { analyticsController } from '../controllers/analyticsController'

const router = Router()

// GET /api/summary - Executive KPI metrics and department/country breakdowns
router.get('/summary', (req, res) => analyticsController.getSummary(req, res))

export default router
