import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import type { DeepDivePayInsights } from '../types'

export function usePayInsights(enabled = true) {
  const [insights, setInsights] = useState<DeepDivePayInsights | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string>('All')
  const [thresholdPercent, setThresholdPercent] = useState<number>(20)

  const fetchPayInsights = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params: Record<string, any> = {
        threshold: thresholdPercent
      }
      if (selectedCountry && selectedCountry !== 'All') {
        params.country = selectedCountry
      }

      const res = await api.get<DeepDivePayInsights>('/analytics/pay-insights', { params })
      setInsights(res.data)
    } catch (err: any) {
      console.error('Failed to load pay insights:', err)
      setError(err.response?.data?.error || err.message || 'Failed to load compensation insights')
    } finally {
      setIsLoading(false)
    }
  }, [selectedCountry, thresholdPercent])

  useEffect(() => {
    if (enabled) {
      fetchPayInsights()
    }
  }, [enabled, fetchPayInsights])

  return {
    insights,
    isLoading,
    error,
    selectedCountry,
    setSelectedCountry,
    thresholdPercent,
    setThresholdPercent,
    refreshPayInsights: fetchPayInsights
  }
}
