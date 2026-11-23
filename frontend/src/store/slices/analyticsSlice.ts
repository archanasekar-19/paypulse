import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { KpiMetrics } from '../../types'
import { MOCK_METRICS } from '../mock/mockData'

export interface AnalyticsState {
  metrics: KpiMetrics
  currencyMode: 'USD' | 'LOCAL'
  isLoading: boolean
}

const initialState: AnalyticsState = {
  metrics: MOCK_METRICS,
  currencyMode: 'USD',
  isLoading: false
}

export const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    toggleCurrencyMode: (state) => {
      state.currencyMode = state.currencyMode === 'USD' ? 'LOCAL' : 'USD'
    },
    setCurrencyMode: (state, action: PayloadAction<'USD' | 'LOCAL'>) => {
      state.currencyMode = action.payload
    },
    setMetrics: (state, action: PayloadAction<KpiMetrics>) => {
      state.metrics = action.payload
    }
  }
})

export const { toggleCurrencyMode, setCurrencyMode, setMetrics } = analyticsSlice.actions

export default analyticsSlice.reducer
