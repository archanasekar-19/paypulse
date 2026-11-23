import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Employee, CurrencyCode } from '../../types'
import { MOCK_EMPLOYEES } from '../mock/mockData'

export interface EmployeeState {
  items: Employee[]
  totalRecords: number
  currentPage: number
  pageSize: number
  searchQuery: string
  selectedDepartment: string
  selectedCountry: string
  sortBy: 'salary' | 'name' | 'department' | 'country'
  sortOrder: 'asc' | 'desc'
  isLoading: boolean
}

const initialState: EmployeeState = {
  items: MOCK_EMPLOYEES,
  totalRecords: 10000, // Reflects the organizational scale
  currentPage: 1,
  pageSize: 10,
  searchQuery: '',
  selectedDepartment: 'ALL',
  selectedCountry: 'ALL',
  sortBy: 'salary',
  sortOrder: 'desc',
  isLoading: false
}

export const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
      state.currentPage = 1 // Reset to page 1 on new search
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
    },
    updateSalary: (
      state,
      action: PayloadAction<{ id: string; newSalary: number; currency?: CurrencyCode }>
    ) => {
      const index = state.items.findIndex((e) => e.id === action.payload.id)
      if (index !== -1) {
        state.items[index].salary = action.payload.newSalary
        if (action.payload.currency) {
          state.items[index].currency = action.payload.currency
        }
      }
    },
    addEmployee: (state, action: PayloadAction<Employee>) => {
      state.items.unshift(action.payload)
      state.totalRecords += 1
    }
  }
})

export const {
  setSearchQuery,
  setSelectedDepartment,
  setSelectedCountry,
  setPage,
  setPageSize,
  setSort,
  updateSalary,
  addEmployee
} = employeeSlice.actions

export default employeeSlice.reducer
