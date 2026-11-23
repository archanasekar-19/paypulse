import { Router } from 'express'
import { analyticsController } from '../controllers/analyticsController'

const router = Router()

// GET /api/summary - Executive KPI metrics and department/country breakdowns
router.get('/summary', (req, res) => analyticsController.getSummary(req, res))

// Deep Dive Pay Insights Routes
// GET /api/analytics/pay-insights or /api/pay-insights
router.get('/pay-insights', (req, res) => analyticsController.getPayInsights(req, res))
router.get('/pay-insights/department-title', (req, res) => analyticsController.getDepartmentAndTitle(req, res))
router.get('/pay-insights/distribution', (req, res) => analyticsController.getSalaryDistribution(req, res))
router.get('/pay-insights/outliers', (req, res) => analyticsController.getOutliers(req, res))

export default router
