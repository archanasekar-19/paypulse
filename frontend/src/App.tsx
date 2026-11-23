import React from 'react'
import { ThemeProvider, CssBaseline, Box, Typography } from '@mui/material'
import { theme } from './theme'
import { Navbar } from './components/layout/Navbar'
import { KpiCards } from './components/dashboard/KpiCards'
import { EmployeeTable } from './components/employees/EmployeeTable'
import { useAppSelector } from './store'

export default function App() {
  // Read state directly from Redux store
  const employees = useAppSelector((state) => state.employees.items)
  const metrics = useAppSelector((state) => state.analytics.metrics)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* Navigation Header */}
        <Navbar />

        {/* Dashboard Main Workspace */}
        <Box sx={{ flex: 1, py: 4, px: { xs: 2, sm: 4, md: 6 } }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Global Compensation Overview
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Consolidated salary governance and payroll analytics for 10,000 employees worldwide
            </Typography>
          </Box>

          {/* Executive KPI Metric Cards */}
          <KpiCards metrics={metrics} />

          {/* Employee Compensation Table */}
          <EmployeeTable employees={employees} />
        </Box>
      </Box>
    </ThemeProvider>
  )
}
