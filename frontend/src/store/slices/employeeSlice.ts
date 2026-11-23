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

// Async Thunk: Fetch paginated, filtered employees
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

// Async Thunk: Create new employee
export const createEmployeeAsync = createAsyncThunk(
  'employees/createEmployeeAsync',
  async (
    payload: {
      firstName: string
      lastName: string
      email: string
      department: string
      country: string
      jobTitle: string
      baseSalary: number
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/employees', payload)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create employee')
    }
  }
)

// Async Thunk: Update full employee record
export const updateEmployeeAsync = createAsyncThunk(
  'employees/updateEmployeeAsync',
  async (
    {
      id,
      data
    }: {
      id: string
      data: {
        firstName?: string
        lastName?: string
        email?: string
        department?: string
        country?: string
        jobTitle?: string
        baseSalary?: number
        bonus?: number
        subsidy?: number
        allowance?: number
        overtimePay?: number
        earnedLeaves?: number
        leaveDays?: number
        insurance?: number
        leaveDeduction?: number
        customAdditions?: any[]
        customDeductions?: any[]
      }
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/employees/${id}`, data)
      return { id, updated: response.data.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update employee')
    }
  }
)

// Async Thunk: Update employee salary
export const updateSalaryAsync = createAsyncThunk(
  'employees/updateSalaryAsync',
  async (
    { id, salary }: { id: string; salary: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/employees/${id}/salary`, { salary })
      return { id, updated: response.data.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update salary')
    }
  }
)

// Async Thunk: Soft-delete / Deactivate employee (PATCH to INACTIVE)
export const deleteEmployeeAsync = createAsyncThunk(
  'employees/deleteEmployeeAsync',
  async (
    arg: { id: string; reason?: string } | string,
    { rejectWithValue }
  ) => {
    try {
      const employeeId = typeof arg === 'string' ? arg : arg.id
      const deactivationReason =
        typeof arg === 'object' && arg.reason
          ? arg.reason
          : 'Deactivated from active payroll roster'
      await api.patch(`/employees/${employeeId}/status`, {
        status: 'INACTIVE',
        reason: deactivationReason
      })
      return employeeId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to deactivate employee')
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
    // fetchEmployees
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

    // createEmployeeAsync
    builder
      .addCase(createEmployeeAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createEmployeeAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.totalRecords += 1
        state.items.unshift({
          id: action.payload.id,
          name: `${action.payload.firstName} ${action.payload.lastName}`,
          email: action.payload.email,
          department: action.payload.department,
          country: action.payload.country,
          jobTitle: action.payload.jobTitle,
          salary: action.payload.baseSalary,
          currency: action.payload.currency
        })
      })
      .addCase(createEmployeeAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // updateEmployeeAsync
    builder
      .addCase(updateEmployeeAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateEmployeeAsync.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((e) => e.id === action.payload.id)
        if (index !== -1) {
          const updated = action.payload.updated
          state.items[index] = {
            id: updated.id,
            name: `${updated.firstName} ${updated.lastName}`,
            firstName: updated.firstName,
            lastName: updated.lastName,
            email: updated.email,
            department: updated.department,
            country: updated.country,
            jobTitle: updated.jobTitle,
            salary: updated.baseSalary,
            baseSalary: updated.baseSalary,
            bonus: updated.bonus,
            subsidy: updated.subsidy,
            allowance: updated.allowance,
            overtimePay: updated.overtimePay,
            grossSalary: updated.grossSalary,
            earnedLeaves: updated.earnedLeaves,
            leaveDays: updated.leaveDays,
            insurance: updated.insurance,
            leaveDeduction: updated.leaveDeduction,
            customAdditions: updated.customAdditions ? (typeof updated.customAdditions === 'string' ? JSON.parse(updated.customAdditions) : updated.customAdditions) : [],
            customDeductions: updated.customDeductions ? (typeof updated.customDeductions === 'string' ? JSON.parse(updated.customDeductions) : updated.customDeductions) : [],
            netSalary: updated.netSalary,
            netSalaryUSD: updated.netSalaryUSD,
            currency: updated.currency
          }
        }
      })
      .addCase(updateEmployeeAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // updateSalaryAsync
    builder
      .addCase(updateSalaryAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateSalaryAsync.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((e) => e.id === action.payload.id)
        if (index !== -1) {
          state.items[index].salary = action.payload.updated.baseSalary
        }
      })
      .addCase(updateSalaryAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // deleteEmployeeAsync
    builder
      .addCase(deleteEmployeeAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteEmployeeAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = state.items.filter((e) => e.id !== action.payload)
        state.totalRecords = Math.max(0, state.totalRecords - 1)
      })
      .addCase(deleteEmployeeAsync.rejected, (state, action) => {
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
