import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Employee } from '../../types'
import { api } from '../../services/api'
import { MOCK_EMPLOYEES } from '../mock/mockData'

export interface EmployeeState {
  items: Employee[]
  totalRecords: number
  currentPage: number
  pageSize: number
  searchQuery: string
  selectedDepartment: string
  selectedCountry: string
  sortBy: 'salary' | 'name' | 'department' | 'country' | 'hireDate'
  sortOrder: 'asc' | 'desc'
  isLoading: boolean
  error: string | null
}

const initialState: EmployeeState = {
  items: MOCK_EMPLOYEES,
  totalRecords: 10000,
  currentPage: 1,
  pageSize: 25,
  searchQuery: '',
  selectedDepartment: 'ALL',
  selectedCountry: 'ALL',
  sortBy: 'salary',
  sortOrder: 'desc',
  isLoading: false,
  error: null
}

// Async Thunk: Fetch paginated, filtered employees from Backend API
export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (
    params: {
      page?: number
      limit?: number
      search?: string
      department?: string
      country?: string
      sortBy?: string
      sortOrder?: string
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/employees', { params })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch employees')
    }
  }
)

export const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
      state.currentPage = 1
    },
    setSelectedDepartment: (state, action: PayloadAction<string>) => {
      state.selectedDepartment = action.payload
      state.currentPage = 1
    },
    setSelectedCountry: (state, action: PayloadAction<string>) => {
      state.selectedCountry = action.payload
      state.currentPage = 1
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload
      state.currentPage = 1
    },
    setSort: (
      state,
      action: PayloadAction<{ sortBy: EmployeeState['sortBy']; sortOrder: 'asc' | 'desc' }>
    ) => {
      state.sortBy = action.payload.sortBy
      state.sortOrder = action.payload.sortOrder
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.data
        state.totalRecords = action.payload.pagination.totalRecords
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const {
  setSearchQuery,
  setSelectedDepartment,
  setSelectedCountry,
  setPage,
  setPageSize,
  setSort
} = employeeSlice.actions

export default employeeSlice.reducer
