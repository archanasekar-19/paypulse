import { useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { fetchSummaryMetrics } from '../store/slices/analyticsSlice'

export const useAnalytics = () => {
  const dispatch = useAppDispatch()
  const {
    metrics,
    departmentBreakdown,
    countryBreakdown,
    isLoading: isAnalyticsLoading,
    error: analyticsError
  } = useAppSelector((state) => state.analytics)

  const refreshAnalytics = useCallback(async () => {
    return dispatch(fetchSummaryMetrics()).unwrap()
  }, [dispatch])

  useEffect(() => {
    refreshAnalytics()
  }, [refreshAnalytics])

  return {
    metrics,
    departmentBreakdown,
    countryBreakdown,
    isAnalyticsLoading,
    analyticsError,
    refreshAnalytics
  }
}
