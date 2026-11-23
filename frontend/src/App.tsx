import { useState } from 'react'
import { ThemeProvider, CssBaseline, Box, Typography, Alert } from '@mui/material'
import { theme } from './theme'
import { Navbar } from './components/layout/Navbar'
import { SalaryFilterToolbar } from './components/common/SalaryFilterToolbar'
import { EmployeeTable } from './components/employees/EmployeeTable'
import { AddEmployeeModal } from './components/employees/AddEmployeeModal'
import { DeleteConfirmDialog } from './components/employees/DeleteConfirmDialog'
import { useEmployees } from './hooks/useEmployees'
import type { Employee, EmployeeFormData } from './types'

export default function App() {
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
    handleSortChange,
    createEmployee,
    updateEmployee,
    deleteEmployee
  } = useEmployees()

  // Modal & Dialog state
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  const showNotification = (message: string, severity: 'success' | 'error' = 'success') => {
    setNotification({ message, severity })
    setTimeout(() => setNotification(null), 3500)
  }

  // Unified Save Handler (Add & Edit)
  const handleSaveEmployee = async (employeeData: EmployeeFormData) => {
    if (editingEmployee) {
      await updateEmployee(editingEmployee.id, employeeData)
      showNotification('Employee record updated successfully!')
    } else {
      await createEmployee(employeeData)
      showNotification('New employee onboarded successfully!')
    }
  }

  // Delete
  const handleConfirmDelete = async (id: string) => {
    await deleteEmployee(id)
    showNotification('Employee removed successfully from roster!')
  }

  const isEmployeeModalOpen = isAddModalOpen || Boolean(editingEmployee)

  const handleCloseEmployeeModal = () => {
    setIsAddModalOpen(false)
    setEditingEmployee(null)
  }

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
            <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>
              Employee Salary Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enterprise CRUD operations, server-side search, filtering, and pagination over 10,000 employees
            </Typography>
          </Box>

          {/* Toast Notification */}
          {notification && (
            <Alert
              severity={notification.severity}
              sx={{ mb: 3 }}
              onClose={() => setNotification(null)}
            >
              {notification.message}
            </Alert>
          )}

          {/* Backend Error Alert */}
          {error && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {error} (Ensure backend server is running on http://localhost:4000)
            </Alert>
          )}

          {/* Standalone Reusable Filter Toolbar with Add Employee Action */}
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
            onOpenAddEmployee={() => setIsAddModalOpen(true)}
          />

          {/* High-Performance Paginated Employee Table with Edit & Delete Actions */}
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
            onEditEmployee={(emp) => setEditingEmployee(emp)}
            onDeleteEmployee={(emp) => setDeletingEmployee(emp)}
          />

          {/* Unified Symmetrical Employee Dialog (Reused for Add & Edit with populated data) */}
          <AddEmployeeModal
            open={isEmployeeModalOpen}
            employee={editingEmployee}
            onClose={handleCloseEmployeeModal}
            onSubmit={handleSaveEmployee}
          />

          {/* Delete Confirmation Popup Dialog (Delete) */}
          <DeleteConfirmDialog
            open={Boolean(deletingEmployee)}
            employee={deletingEmployee}
            onClose={() => setDeletingEmployee(null)}
            onConfirm={handleConfirmDelete}
          />
        </Box>
      </Box>
    </ThemeProvider>
  )
}
