import React, { useState } from 'react'
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  AppBar,
  Toolbar
} from '@mui/material'
import { Icon } from '@iconify/react'
import { theme } from './theme'
import type { Employee } from './types'

// Realistic initial employee records
const initialEmployees: Employee[] = [
  {
    id: '1',
    name: 'Sarah Connor',
    email: 'sarah.c@acme.com',
    department: 'Engineering',
    country: 'United States',
    jobTitle: 'Senior Software Engineer',
    salary: 145000,
    currency: 'USD'
  },
  {
    id: '2',
    name: 'Rajesh Sharma',
    email: 'rajesh.s@acme.com',
    department: 'Engineering',
    country: 'India',
    jobTitle: 'Lead Architect',
    salary: 3400000,
    currency: 'INR'
  },
  {
    id: '3',
    name: 'Emma Watson',
    email: 'emma.w@acme.com',
    department: 'Product',
    country: 'United Kingdom',
    jobTitle: 'Principal Product Manager',
    salary: 92000,
    currency: 'GBP'
  },
  {
    id: '4',
    name: 'Hans Gruber',
    email: 'hans.g@acme.com',
    department: 'Finance',
    country: 'Germany',
    jobTitle: 'Finance Director',
    salary: 98000,
    currency: 'EUR'
  },
  {
    id: '5',
    name: 'Kenji Sato',
    email: 'kenji.s@acme.com',
    department: 'Sales',
    country: 'Japan',
    jobTitle: 'VP of Global Sales',
    salary: 16500000,
    currency: 'JPY'
  },
  {
    id: '6',
    name: 'Elena Rostova',
    email: 'elena.r@acme.com',
    department: 'Human Resources',
    country: 'Canada',
    jobTitle: 'Global People Operations Lead',
    salary: 115000,
    currency: 'CAD'
  }
]

// Department badge styling helpers
const getDeptColor = (dept: string) => {
  switch (dept) {
    case 'Engineering':
      return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' }
    case 'Product':
      return { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' }
    case 'Finance':
      return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' }
    case 'Sales':
      return { bg: '#fffbeb', color: '#b45309', border: '#fde68a' }
    case 'Human Resources':
      return { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' }
    default:
      return { bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' }
  }
}

export default function App() {
  const [employees] = useState<Employee[]>(initialEmployees)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* Top Navigation Bar - Full Width Edge to Edge */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            color: '#0f172a',
            width: '100%'
          }}
        >
          <Toolbar sx={{ height: 70, px: { xs: 2, sm: 4, md: 6 }, justifyContent: 'space-between' }}>
            {/* Brand Logo & Name */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  backgroundColor: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <Icon icon="solar:wallet-money-bold-duotone" width="26" height="26" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                  PayPulse
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Global Compensation Platform
                </Typography>
              </Box>
            </Box>

            {/* User & Org Badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={<Icon icon="solar:buildings-2-linear" width="16" height="16" />}
                label="ACME Corp • Global"
                variant="outlined"
                size="small"
                sx={{ borderColor: '#cbd5e1', fontWeight: 600, color: '#475569' }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    fontSize: '0.875rem',
                    fontWeight: 700
                  }}
                >
                  EV
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="subtitle2" fontWeight="600" sx={{ lineHeight: 1.2 }}>
                    Elena Vance
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    HR Manager
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main Content Area - Full Responsive Container */}
        <Box sx={{ flex: 1, py: 4, px: { xs: 2, sm: 4, md: 6 } }}>
          {/* Page Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Global Compensation Overview
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Consolidated salary governance and payroll analytics for 10,000 employees worldwide
            </Typography>
          </Box>

          {/* 4 Executive KPI Metric Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Total Payroll Spend */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Total Annual Payroll
                  </Typography>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      backgroundColor: '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563eb'
                    }}
                  >
                    <Icon icon="solar:banknote-2-linear" width="22" height="22" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  $842,150,000
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, fontWeight: 600 }}>
                  <Icon icon="solar:arrow-up-linear" width="14" height="14" />
                  Normalized USD
                </Typography>
              </Paper>
            </Grid>

            {/* Global Headcount */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Global Headcount
                  </Typography>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      backgroundColor: '#ecfdf5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981'
                    }}
                  >
                    <Icon icon="solar:users-group-two-rounded-linear" width="22" height="22" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  10,000
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Across 7 operating countries
                </Typography>
              </Paper>
            </Grid>

            {/* Average Salary */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Average Salary
                  </Typography>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      backgroundColor: '#faf5ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#7e22ce'
                    }}
                  >
                    <Icon icon="solar:chart-2-linear" width="22" height="22" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  $84,215
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Org-wide mean compensation
                </Typography>
              </Paper>
            </Grid>

            {/* Median Salary */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Median Salary
                  </Typography>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      backgroundColor: '#fffbeb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#b45309'
                    }}
                  >
                    <Icon icon="solar:scale-linear" width="22" height="22" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  $78,500
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Middle-earner benchmark
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Employee Compensation Table */}
          <Paper sx={{ overflow: 'hidden' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">
                  Employee Salary Roster
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Individual compensation details and contracts
                </Typography>
              </Box>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell>Job Title</TableCell>
                    <TableCell align="right">Base Salary</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((emp) => {
                    const deptStyle = getDeptColor(emp.department)
                    const initials = emp.name.split(' ').map(n => n[0]).join('')
                    return (
                      <TableRow key={emp.id} hover sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                        {/* Name & Avatar */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 34,
                                height: 34,
                                fontSize: '0.8125rem',
                                fontWeight: 700,
                                backgroundColor: '#f1f5f9',
                                color: '#334155'
                              }}
                            >
                              {initials}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                                {emp.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {emp.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Department Chip */}
                        <TableCell>
                          <Box
                            component="span"
                            sx={{
                              display: 'inline-block',
                              px: 1.2,
                              py: 0.4,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: deptStyle.bg,
                              color: deptStyle.color,
                              border: `1px solid ${deptStyle.border}`
                            }}
                          >
                            {emp.department}
                          </Box>
                        </TableCell>

                        {/* Country */}
                        <TableCell>
                          <Typography variant="body2" color="text.primary">
                            {emp.country}
                          </Typography>
                        </TableCell>

                        {/* Job Title */}
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {emp.jobTitle}
                          </Typography>
                        </TableCell>

                        {/* Salary */}
                        <TableCell align="right">
                          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                            {emp.currency} {emp.salary.toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
