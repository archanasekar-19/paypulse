import { useState, useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
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

  // Department change: only updates local UI selection without triggering API
  const handleDepartmentChange = (dept: string) => {
    setSelectedDepartment(dept)
  }

  // Country change: only updates local UI selection without triggering API
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country)
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

  // Update employee record
  const updateEmployee = async (
    id: string,
    payload: {
      firstName: string
      lastName: string
      email: string
      department: string
      country: string
      jobTitle: string
      baseSalary: number
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

  // Delete employee
  const deleteEmployee = async (id: string) => {
    await dispatch(deleteEmployeeAsync(id)).unwrap()
    await refreshEmployees()
  }

  return {
    employees,
    totalRecords,
    isLoading,
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

    // Refresh
    refreshEmployees
  }
}
