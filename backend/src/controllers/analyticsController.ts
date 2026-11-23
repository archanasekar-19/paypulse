import type { Request, Response } from 'express'
import { analyticsService } from '../services/analyticsService'

export class AnalyticsController {
  async getSummary(_req: Request, res: Response) {
    try {
      const summary = await analyticsService.getSummaryMetrics()
      return res.status(200).json(summary)
    } catch (error) {
      console.error('Error calculating summary metrics:', error)
      return res.status(500).json({ error: 'Failed to calculate summary metrics' })
    }
  }

  async getPayInsights(req: Request, res: Response) {
    try {
      const country = typeof req.query.country === 'string' ? req.query.country : undefined
      const threshold = req.query.threshold ? Number(req.query.threshold) : 20
      const insights = await analyticsService.getDeepDivePayInsights(country, threshold)
      return res.status(200).json(insights)
    } catch (error) {
      console.error('Error calculating pay insights:', error)
      return res.status(500).json({ error: 'Failed to calculate pay insights' })
    }
  }

  async getDepartmentAndTitle(req: Request, res: Response) {
    try {
      const country = typeof req.query.country === 'string' ? req.query.country : undefined
      const data = await analyticsService.getByDepartmentAndTitle(country)
      return res.status(200).json(data)
    } catch (error) {
      console.error('Error calculating department/title metrics:', error)
      return res.status(500).json({ error: 'Failed to calculate department/title metrics' })
    }
  }

  async getSalaryDistribution(req: Request, res: Response) {
    try {
      const country = typeof req.query.country === 'string' ? req.query.country : undefined
      const data = await analyticsService.getSalaryDistribution(country)
      return res.status(200).json(data)
    } catch (error) {
      console.error('Error calculating salary distribution:', error)
      return res.status(500).json({ error: 'Failed to calculate salary distribution' })
    }
  }

  async getOutliers(req: Request, res: Response) {
    try {
      const threshold = req.query.threshold ? Number(req.query.threshold) : 20
      const limit = req.query.limit ? Number(req.query.limit) : 50
      const country = typeof req.query.country === 'string' ? req.query.country : undefined
      const data = await analyticsService.getOutliers(threshold, limit, country)
      return res.status(200).json(data)
    } catch (error) {
      console.error('Error calculating compensation outliers:', error)
      return res.status(500).json({ error: 'Failed to calculate compensation outliers' })
    }
  }
}

export const analyticsController = new AnalyticsController()
