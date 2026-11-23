import React from 'react'
import { ThemeProvider, CssBaseline, Box, Typography, Alert } from '@mui/material'
import { theme } from './theme'
import { Navbar } from './components/layout/Navbar'
import { SalaryFilterToolbar } from './components/common/SalaryFilterToolbar'
import { EmployeeTable } from './components/employees/EmployeeTable'
import { useEmployees } from './hooks/useEmployees'

export default function App() {
  // Consume all employee list state, pagination, and actions from the custom hook
  const {
    employees,
    totalRecords,
    isLoading,
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    searchInput,
    setSearchInput,
    appliedSearch,
    handleSearch,
    selectedDepartment,
    handleDepartmentChange,
    selectedCountry,
    handleCountryChange,
    handleResetFilters,
    sortBy,
    sortOrder,
    handleSortChange
  } = useEmployees()

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* Navigation Header */}
        <Navbar />

        {/* Main Workspace */}
        <Box sx={{ flex: 1, py: 4, px: { xs: 2, sm: 4, md: 6 } }}>
          {/* Page Title */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Employee Salary Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Direct server-side search, filtering, and pagination across 10,000 employees
            </Typography>
          </Box>

          {/* Executive KPI Metric Cards (Phase 2 - Analytics) */}
          {/* <KpiCards metrics={metrics} /> */}

          {error && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {error} (Ensure backend server is running on http://localhost:4000)
            </Alert>
          )}

          {/* Standalone Reusable Filter Toolbar (Reusable for Analytics & Table) */}
          <SalaryFilterToolbar
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onSearch={handleSearch}
            appliedSearch={appliedSearch}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={handleDepartmentChange}
            selectedCountry={selectedCountry}
            onCountryChange={handleCountryChange}
            totalCount={totalRecords}
            onResetFilters={handleResetFilters}
          />

          {/* High-Performance Paginated Employee Table */}
          <EmployeeTable
            employees={employees}
            totalRecords={totalRecords}
            currentPage={page}
            pageSize={pageSize}
            sortBy={sortBy}
            sortOrder={sortOrder}
            isLoading={isLoading}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onSortChange={handleSortChange}
          />
        </Box>
      </Box>
    </ThemeProvider>
  )
}
