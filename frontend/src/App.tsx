import { useState, useEffect, lazy, Suspense } from 'react'
import { ThemeProvider, CssBaseline, Box, Typography, Alert, Skeleton, Grid, Paper } from '@mui/material'
import toast, { Toaster } from 'react-hot-toast'
import { theme } from './theme'
import { Navbar } from './components/layout/Navbar'
import { LoginPage } from './components/auth/LoginPage'
import { KpiCards } from './components/dashboard/KpiCards'

// Code-split PayInsightsPage and recharts so initial load remains ultra-lightweight
const PayInsightsPage = lazy(() => import('./components/analytics/PayInsightsPage'))
import { SalaryFilterToolbar } from './components/common/SalaryFilterToolbar'
import { EmployeeTable } from './components/employees/EmployeeTable'
import { AddEmployeeModal } from './components/employees/AddEmployeeModal'
import { DeleteConfirmDialog } from './components/employees/DeleteConfirmDialog'
import { PaySlipModal } from './components/employees/PaySlipModal'
import { SalaryHistoryModal } from './components/employees/SalaryHistoryModal'
import { useEmployees } from './hooks/useEmployees'
import { useAnalytics } from './hooks/useAnalytics'
import { usePayInsights } from './hooks/usePayInsights'
import { api } from './services/api'
import type { Employee, EmployeeFormData, CompensationUpdateData, NewSalaryRevisionInput, AuthUser } from './types'

export default function App() {
  // Session Authentication state backed by localStorage / sessionStorage
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('paypulse_auth_user') || sessionStorage.getItem('paypulse_auth_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // URL-driven navigation tab state: 'roster' | 'analytics'
  const [activeTab, setActiveTab] = useState<'roster' | 'analytics'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/analytics' || window.location.hash === '#analytics') {
        return 'analytics'
      }
    }
    return 'roster'
  })

  // Synchronize browser history / hash on navigation
  const handleTabChange = (tab: 'roster' | 'analytics') => {
    setActiveTab(tab)
    if (tab === 'analytics') {
      window.history.pushState(null, '', '#analytics')
    } else {
      window.history.pushState(null, '', '#roster')
    }
  }

  useEffect(() => {
    const handleLocationChange = () => {
      if (window.location.pathname === '/analytics' || window.location.hash === '#analytics') {
        setActiveTab('analytics')
      } else {
        setActiveTab('roster')
      }
    }
    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('hashchange', handleLocationChange)
    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('hashchange', handleLocationChange)
    }
  }, [])

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
    deleteEmployee,
    isExporting,
    exportToCSV,
    fetchSalaryHistory,
    recordSalaryRevision
  } = useEmployees()

  // Real-time Executive Compensation Analytics
  const { metrics, isAnalyticsLoading, refreshAnalytics } = useAnalytics()

  // Deep Dive Pay Insights Hook (SQL Aggregated, only enabled when analytics route is active)
  const {
    insights: payInsights,
    isLoading: isPayInsightsLoading,
    error: payInsightsError,
    selectedCountry: insightsCountry,
    setSelectedCountry: setInsightsCountry,
    thresholdPercent: outlierThreshold,
    setThresholdPercent: setOutlierThreshold,
    refreshPayInsights
  } = usePayInsights(activeTab === 'analytics')

  // Modal & Dialog state
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null)
  const [viewingPaySlipEmployee, setViewingPaySlipEmployee] = useState<Employee | null>(null)
  const [viewingHistoryEmployee, setViewingHistoryEmployee] = useState<Employee | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Session Logout Handler
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Graceful offline fallback
    }
    localStorage.removeItem('paypulse_auth_user')
    sessionStorage.removeItem('paypulse_auth_user')
    setCurrentUser(null)
    toast.success('Signed out successfully.')
  }

  // Unified Save Handler (Add & Edit) with react-hot-toast
  const handleSaveEmployee = async (employeeData: EmployeeFormData) => {
    if (editingEmployee) {
      await updateEmployee(editingEmployee.id, employeeData)
      toast.success('Employee record updated successfully!')
    } else {
      await createEmployee(employeeData)
      toast.success('Employee record added successfully!')
    }
    await Promise.all([refreshAnalytics(), refreshPayInsights()])
  }

  // Save Welfare & Deductions from PaySlipModal with react-hot-toast
  const handleSaveCompensationAdjustments = async (
    id: string,
    compensationData: CompensationUpdateData
  ) => {
    await updateEmployee(id, compensationData)
    toast.success('Payslip updated successfully!')
    await Promise.all([refreshAnalytics(), refreshPayInsights()])
  }

  // Soft-Delete / Deactivate with react-hot-toast
  const handleConfirmDelete = async (id: string, reason?: string) => {
    await deleteEmployee(id, reason)
    toast.success('Employee deactivated successfully!')
    await Promise.all([refreshAnalytics(), refreshPayInsights()])
  }

  // Export filtered payroll roster with react-hot-toast
  const handleExportCSV = async () => {
    try {
      await exportToCSV()
      toast.success('Payroll records exported successfully!')
    } catch {
      toast.error('Failed to export payroll records to CSV')
    }
  }

  // Record a salary revision into timeline with react-hot-toast
  const handleRecordSalaryRevision = async (id: string, revision: NewSalaryRevisionInput) => {
    const res = await recordSalaryRevision(id, revision)
    toast.success('Salary adjustment recorded successfully!')
    await Promise.all([refreshAnalytics(), refreshPayInsights()])
    return res
  }

  const isEmployeeModalOpen = isAddModalOpen || Boolean(editingEmployee)

  const handleCloseEmployeeModal = () => {
    setIsAddModalOpen(false)
    setEditingEmployee(null)
  }

  // If unauthenticated, present the clean login interface
  if (!currentUser) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '8px',
              background: '#1e242e',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600
            }
          }}
        />
        <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* React Hot Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '8px',
            background: '#1e242e',
            color: '#ffffff',
            fontSize: '0.85rem',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff'
            }
          }
        }}
      />

      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* Navigation Header with Route Switcher */}
        <Navbar
          currentUser={currentUser}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={handleLogout}
        />

        {/* Main Workspace */}
        <Box sx={{ flex: 1, py: 2.75, px: { xs: 2, sm: 3.5, md: 4.5 }, maxWidth: 1440, mx: 'auto', width: '100%' }}>
          {/* Backend Error Alert */}
          {error && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {error} (Ensure backend server is running on http://localhost:4000)
            </Alert>
          )}

          {/* ROUTE 1: Deep Dive Pay Insights Analytics (Code-split with Suspense) */}
          {activeTab === 'analytics' ? (
            <Suspense
              fallback={
                <Box sx={{ width: '100%', pb: 8 }}>
                  <Box sx={{ mb: 3.5 }}>
                    <Skeleton variant="text" width={200} height={24} sx={{ mb: 1, borderRadius: '4px' }} />
                    <Skeleton variant="text" width={380} height={42} sx={{ mb: 0.5, borderRadius: '6px' }} />
                    <Skeleton variant="text" width={560} height={22} sx={{ borderRadius: '4px' }} />
                  </Box>
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper sx={{ p: 2.25, borderRadius: '12px', border: '1px solid #eef1f6', height: '100%' }}>
                          <Skeleton variant="rounded" width={32} height={32} sx={{ mb: 1.5, borderRadius: '8px' }} />
                          <Skeleton variant="text" width="75%" height={38} sx={{ mb: 0.5, borderRadius: '6px' }} />
                          <Skeleton variant="text" width="85%" height={18} sx={{ borderRadius: '4px' }} />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                  <Skeleton variant="rounded" width="100%" height={320} sx={{ borderRadius: '14px' }} />
                </Box>
              }
            >
              <PayInsightsPage
                insights={payInsights}
                isLoading={isPayInsightsLoading}
                error={payInsightsError}
                selectedCountry={insightsCountry}
                onCountryChange={setInsightsCountry}
                thresholdPercent={outlierThreshold}
                onThresholdChange={setOutlierThreshold}
                onBackToRoster={() => handleTabChange('roster')}
              />
            </Suspense>
          ) : (
            /* ROUTE 2: Main Payroll Roster & Operations */
            <>
              {/* iLovePDF Clean Symmetrical Hero Header */}
              <Box sx={{ mb: 2.5, textAlign: { xs: 'left', sm: 'center' }, maxWidth: 860, mx: 'auto' }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e242e', letterSpacing: '-0.025em', mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.85rem' } }}>
                  Global Compensation & Payroll Hub
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Real-time payroll analytics, attendance & leave mechanics, and employee welfare management across 7 operating countries
                </Typography>
              </Box>

              {/* Executive Macro KPI Cards (Total Payroll, Headcount, Average, Median) */}
              <KpiCards metrics={metrics} isLoading={isAnalyticsLoading} />

              {/* Standalone Reusable Filter Toolbar with Add Employee & Export CSV Actions */}
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
                onExportCSV={handleExportCSV}
                isExporting={isExporting}
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
                onViewHistory={(emp) => setViewingHistoryEmployee(emp)}
                onEditEmployee={(emp) => setEditingEmployee(emp)}
                onDeleteEmployee={(emp) => setDeletingEmployee(emp)}
              />
            </>
          )}

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
            onOpenHistory={(emp) => setViewingHistoryEmployee(emp)}
          />

          {/* Delete Confirmation Popup Dialog (Delete) */}
          <DeleteConfirmDialog
            open={Boolean(deletingEmployee)}
            employee={deletingEmployee}
            onClose={() => setDeletingEmployee(null)}
            onConfirm={handleConfirmDelete}
          />

          {/* Salary Revision Audit Trail & Timeline Modal */}
          <SalaryHistoryModal
            open={Boolean(viewingHistoryEmployee)}
            employee={viewingHistoryEmployee}
            onClose={() => setViewingHistoryEmployee(null)}
            onFetchHistory={fetchSalaryHistory}
            onRecordRevision={handleRecordSalaryRevision}
          />
        </Box>
      </Box>
    </ThemeProvider>
  )
}
