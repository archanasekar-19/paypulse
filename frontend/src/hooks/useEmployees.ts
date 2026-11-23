import { useState, useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { fetchEmployees } from '../store/slices/employeeSlice'

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

  // Filter state
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL')
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL')

  // Sorting state
  const [sortBy, setSortBy] = useState<'salary' | 'name' | 'department' | 'country' | 'hireDate'>('salary')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Function to dispatch fetch to backend
  const refreshEmployees = useCallback(() => {
    dispatch(
      fetchEmployees({
        page,
        limit: pageSize,
        search: appliedSearch.trim() || undefined,
        department: selectedDepartment !== 'ALL' ? selectedDepartment : undefined,
        country: selectedCountry !== 'ALL' ? selectedCountry : undefined,
        sortBy,
        sortOrder
      })
    )
  }, [dispatch, page, pageSize, appliedSearch, selectedDepartment, selectedCountry, sortBy, sortOrder])

  // Trigger fetch when any query parameter changes
  useEffect(() => {
    refreshEmployees()
  }, [refreshEmployees])

  // Search button click handler (prevents keystroke dispatch)
  const handleSearch = () => {
    setPage(1)
    setAppliedSearch(searchInput.trim())
  }

  // Reset all filters handler
  const handleResetFilters = () => {
    setSearchInput('')
    setAppliedSearch('')
    setSelectedDepartment('ALL')
    setSelectedCountry('ALL')
    setPage(1)
  }

  // Department change
  const handleDepartmentChange = (dept: string) => {
    setSelectedDepartment(dept)
    setPage(1)
  }

  // Country change
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country)
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
    handleDepartmentChange,
    selectedCountry,
    handleCountryChange,
    handleResetFilters,

    // Sorting
    sortBy,
    sortOrder,
    handleSortChange,

    // Refresh
    refreshEmployees
  }
}
