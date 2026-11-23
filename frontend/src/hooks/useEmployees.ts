import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import { useAppDispatch, useAppSelector } from '../store'
import type { SalaryHistoryResponse, NewSalaryRevisionInput } from '../types'
import {
  fetchEmployees,
  updateSalaryAsync,
  updateEmployeeAsync,
  createEmployeeAsync,
  deleteEmployeeAsync
} from '../store/slices/employeeSlice'

export const useEmployees = () => {
  const dispatch = useAppDispatch()

  // State from Redux
  const {
    items: employees,
    totalRecords,
    isLoading,
    error
  } = useAppSelector((state) => state.employees)

  // Pagination state
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(25)

  // Search input (user typing) vs applied search (triggered on Search button click)
  const [searchInput, setSearchInput] = useState<string>('')
  const [appliedSearch, setAppliedSearch] = useState<string>('')

  // Filter state: user selection in dropdowns (staged) vs applied filters (triggered on Search button click)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL')
  const [appliedDepartment, setAppliedDepartment] = useState<string>('ALL')

  const [selectedCountry, setSelectedCountry] = useState<string>('ALL')
  const [appliedCountry, setAppliedCountry] = useState<string>('ALL')

  // Sorting state
  const [sortBy, setSortBy] = useState<'salary' | 'name' | 'department' | 'country' | 'hireDate'>('salary')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Function to dispatch fetch to backend - ONLY depends on APPLIED filters
  const refreshEmployees = useCallback(async () => {
    return dispatch(
      fetchEmployees({
        page,
        limit: pageSize,
        search: appliedSearch.trim() || undefined,
        department: appliedDepartment !== 'ALL' ? appliedDepartment : undefined,
        country: appliedCountry !== 'ALL' ? appliedCountry : undefined,
        sortBy,
        sortOrder
      })
    ).unwrap()
  }, [dispatch, page, pageSize, appliedSearch, appliedDepartment, appliedCountry, sortBy, sortOrder])

  // Trigger fetch when any APPLIED query parameter changes
  useEffect(() => {
    refreshEmployees()
  }, [refreshEmployees])

  // Search button click handler: applies search text, department, and country simultaneously
  const handleSearch = () => {
    setPage(1)
    setAppliedSearch(searchInput.trim())
    setAppliedDepartment(selectedDepartment)
    setAppliedCountry(selectedCountry)
  }

  // Reset all filters handler: resets both staged inputs and applied values
  const handleResetFilters = () => {
    setSearchInput('')
    setSelectedDepartment('ALL')
    setSelectedCountry('ALL')
    setAppliedSearch('')
    setAppliedDepartment('ALL')
    setAppliedCountry('ALL')
    setPage(1)
  }

  // Department change: immediately filters table and resets to page 1
  const handleDepartmentChange = (dept: string) => {
    setSelectedDepartment(dept)
    setAppliedDepartment(dept)
    setPage(1)
  }

  // Country change: immediately filters table and resets to page 1
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country)
    setAppliedCountry(country)
    setPage(1)
  }

  // Sorting change
  const handleSortChange = (column: 'salary' | 'name' | 'department' | 'country' | 'hireDate') => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortOrder(column === 'salary' ? 'desc' : 'asc')
    }
    setPage(1)
  }

  // Create employee
  const createEmployee = async (payload: {
    firstName: string
    lastName: string
    email: string
    department: string
    country: string
    jobTitle: string
    baseSalary: number
  }) => {
    await dispatch(createEmployeeAsync(payload)).unwrap()
    await refreshEmployees()
  }

  // Update employee record (supports full profile & compensation adjustments)
  const updateEmployee = async (
    id: string,
    payload: {
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
  ) => {
    await dispatch(updateEmployeeAsync({ id, data: payload })).unwrap()
    await refreshEmployees()
  }

  // Update employee salary
  const updateSalary = async (id: string, newSalary: number) => {
    await dispatch(updateSalaryAsync({ id, salary: newSalary })).unwrap()
    await refreshEmployees()
  }

  // Soft-delete / Deactivate employee (PATCH to INACTIVE)
  const deleteEmployee = async (id: string, reason?: string) => {
    await dispatch(deleteEmployeeAsync({ id, reason })).unwrap()
    await refreshEmployees()
  }

  // Export filtered payroll roster to CSV
  const [isExporting, setIsExporting] = useState<boolean>(false)

  const exportToCSV = async () => {
    try {
      setIsExporting(true)
      const params = new URLSearchParams()
      if (appliedSearch.trim()) params.append('search', appliedSearch.trim())
      if (appliedDepartment !== 'ALL') params.append('department', appliedDepartment)
      if (appliedCountry !== 'ALL') params.append('country', appliedCountry)
      if (sortBy) params.append('sortBy', sortBy)
      if (sortOrder) params.append('sortOrder', sortOrder)

      const response = await api.get(`/employees/export?${params.toString()}`, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const dateStr = new Date().toISOString().slice(0, 10)
      const deptSuffix = appliedDepartment !== 'ALL' ? `_${appliedDepartment}` : ''
      const countrySuffix = appliedCountry !== 'ALL' ? `_${appliedCountry}` : ''
      link.setAttribute('download', `PayPulse_Payroll_${dateStr}${deptSuffix}${countrySuffix}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      return true
    } catch (err) {
      console.error('Failed to export CSV:', err)
      throw err
    } finally {
      setIsExporting(false)
    }
  }

  // Fetch Salary History timeline
  const fetchSalaryHistory = async (employeeId: string): Promise<SalaryHistoryResponse> => {
    const response = await api.get<SalaryHistoryResponse>(`/employees/${employeeId}/history`)
    return response.data
  }

  // Record a new Salary Revision
  const recordSalaryRevision = async (
    employeeId: string,
    revision: NewSalaryRevisionInput
  ): Promise<any> => {
    const response = await api.post(`/employees/${employeeId}/history`, revision)
    await refreshEmployees()
    return response.data
  }

  return {
    employees,
    totalRecords,
    isLoading,
    isExporting,
    error,

    // Pagination
    page,
    setPage,
    pageSize,
    setPageSize,

    // Search
    searchInput,
    setSearchInput,
    appliedSearch,
    handleSearch,

    // Filters
    selectedDepartment,
    appliedDepartment,
    handleDepartmentChange,
    selectedCountry,
    appliedCountry,
    handleCountryChange,
    handleResetFilters,

    // Sorting
    sortBy,
    sortOrder,
    handleSortChange,

    // CRUD Actions
    createEmployee,
    updateEmployee,
    updateSalary,
    deleteEmployee,
    exportToCSV,
    fetchSalaryHistory,
    recordSalaryRevision,

    // Refresh
    refreshEmployees
  }
}
