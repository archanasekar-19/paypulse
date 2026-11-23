import React from 'react'
import {
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar
} from '@mui/material'
import type { Employee } from '../../types'
import { formatCurrency, getInitials } from '../../utils/formatters'
import { getDepartmentStyle } from '../../constants/departments'

interface EmployeeTableProps {
  employees: Employee[]
  title?: string
  subtitle?: string
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  title = 'Employee Salary Roster',
  subtitle = 'Individual compensation details and contracts'
}) => {
  return (
    <Paper elevation={0} sx={{ overflow: 'hidden' }}>
      {/* Table Header Section */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff'
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </Box>

      {/* Table Container */}
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
            {employees.length > 0 ? (
              employees.map((emp) => {
                const deptStyle = getDepartmentStyle(emp.department)
                const initials = getInitials(emp.name)

                return (
                  <TableRow
                    key={emp.id}
                    hover
                    sx={{
                      '&:hover': { backgroundColor: '#f8fafc' },
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    {/* Employee Name & Email */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            backgroundColor: '#f1f5f9',
                            color: '#334155',
                            border: '1px solid #e2e8f0'
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

                    {/* Department Badge */}
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
                        {formatCurrency(emp.salary, emp.currency)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No employee records found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
