import { useState } from 'react'
import { ThemeProvider, CssBaseline, Box, Typography, Alert } from '@mui/material'
import { theme } from './theme'
import { Navbar } from './components/layout/Navbar'
import { KpiCards } from './components/dashboard/KpiCards'
import { SalaryFilterToolbar } from './components/common/SalaryFilterToolbar'
import { EmployeeTable } from './components/employees/EmployeeTable'
import { AddEmployeeModal } from './components/employees/AddEmployeeModal'
import { DeleteConfirmDialog } from './components/employees/DeleteConfirmDialog'
import { PaySlipModal } from './components/employees/PaySlipModal'
import { useEmployees } from './hooks/useEmployees'
import { useAnalytics } from './hooks/useAnalytics'
import type { Employee, EmployeeFormData, CompensationUpdateData } from './types'

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

  // Real-time Executive Compensation Analytics
  const { metrics, isAnalyticsLoading, refreshAnalytics } = useAnalytics()

  // Modal & Dialog state
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null)
  const [viewingPaySlipEmployee, setViewingPaySlipEmployee] = useState<Employee | null>(null)
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
    await refreshAnalytics()
  }

  // Save Welfare & Deductions from PaySlipModal
  const handleSaveCompensationAdjustments = async (
    id: string,
    compensationData: CompensationUpdateData
  ) => {
    await updateEmployee(id, compensationData)
    showNotification('Compensation structure and take-home pay updated successfully!')
    await refreshAnalytics()
  }

  // Delete
  const handleConfirmDelete = async (id: string) => {
    await deleteEmployee(id)
    showNotification('Employee removed successfully from roster!')
    await refreshAnalytics()
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
        <Box sx={{ flex: 1, py: 2.75, px: { xs: 2, sm: 3.5, md: 4.5 }, maxWidth: 1440, mx: 'auto', width: '100%' }}>
          {/* iLovePDF Clean Symmetrical Hero Header */}
          <Box sx={{ mb: 2.5, textAlign: { xs: 'left', sm: 'center' }, maxWidth: 860, mx: 'auto' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e242e', letterSpacing: '-0.025em', mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.85rem' } }}>
              Global Compensation & Payroll Hub
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
              Real-time payroll analytics, attendance & leave mechanics, and employee welfare management across 7 operating countries
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

          {/* Executive Macro KPI Cards (Total Payroll, Headcount, Average, Median) */}
          <KpiCards metrics={metrics} isLoading={isAnalyticsLoading} />

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
            onViewPaySlip={(emp) => setViewingPaySlipEmployee(emp)}
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

          {/* Employee Compensation Slip & Welfare Breakdown Modal */}
          <PaySlipModal
            open={Boolean(viewingPaySlipEmployee)}
            employee={viewingPaySlipEmployee}
            onClose={() => setViewingPaySlipEmployee(null)}
            onSave={handleSaveCompensationAdjustments}
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
