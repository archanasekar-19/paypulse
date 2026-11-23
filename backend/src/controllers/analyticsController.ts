import type { Request, Response } from 'express'
import { analyticsService } from '../services/analyticsService'

export class AnalyticsController {
  async getSummary(req: Request, res: Response) {
    try {
      const summary = await analyticsService.getSummaryMetrics()
      return res.status(200).json(summary)
    } catch (error) {
      console.error('Error calculating summary metrics:', error)
      return res.status(500).json({ error: 'Failed to calculate summary metrics' })
    }
  }
}

export const analyticsController = new AnalyticsController()
