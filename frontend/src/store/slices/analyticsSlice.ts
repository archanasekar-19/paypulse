import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { KpiMetrics, DepartmentSummary, CountrySummary } from '../../types'
import { api } from '../../services/api'
import { MOCK_METRICS } from '../mock/mockData'

export interface AnalyticsState {
  metrics: KpiMetrics
  departmentBreakdown: DepartmentSummary[]
  countryBreakdown: CountrySummary[]
  currencyMode: 'USD' | 'LOCAL'
  isLoading: boolean
  error: string | null
}

const initialState: AnalyticsState = {
  metrics: MOCK_METRICS,
  departmentBreakdown: [],
  countryBreakdown: [],
  currencyMode: 'USD',
  isLoading: false,
  error: null
}

// Async Thunk: Fetch company-wide executive compensation KPIs from /api/summary
export const fetchSummaryMetrics = createAsyncThunk(
  'analytics/fetchSummaryMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/summary')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch analytics summary')
    }
  }
)

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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSummaryMetrics.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSummaryMetrics.fulfilled, (state, action) => {
        state.isLoading = false
        state.metrics = {
          totalEmployees: action.payload.totalEmployees,
          totalPayrollUSD: action.payload.totalPayrollUSD,
          averageSalaryUSD: action.payload.averageSalaryUSD,
          medianSalaryUSD: action.payload.medianSalaryUSD
        }
        state.departmentBreakdown = action.payload.departmentBreakdown || []
        state.countryBreakdown = action.payload.countryBreakdown || []
      })
      .addCase(fetchSummaryMetrics.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const { toggleCurrencyMode, setCurrencyMode, setMetrics } = analyticsSlice.actions

export default analyticsSlice.reducer
