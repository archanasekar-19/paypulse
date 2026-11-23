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
  TablePagination,
  TableSortLabel,
  Avatar,
  LinearProgress
} from '@mui/material'
import type { Employee } from '../../types'
import { formatCurrency, getInitials } from '../../utils/formatters'
import { getDepartmentStyle } from '../../constants/departments'

interface EmployeeTableProps {
  employees: Employee[]
  totalRecords: number
  currentPage: number
  pageSize: number
  sortBy: 'salary' | 'name' | 'department' | 'country' | 'hireDate'
  sortOrder: 'asc' | 'desc'
  isLoading?: boolean
  onPageChange: (newPage: number) => void
  onPageSizeChange: (newPageSize: number) => void
  onSortChange: (column: 'salary' | 'name' | 'department' | 'country' | 'hireDate') => void
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  totalRecords,
  currentPage,
  pageSize,
  sortBy,
  sortOrder,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
  onSortChange
}) => {
  return (
    <Paper elevation={0} sx={{ overflow: 'hidden', border: '1px solid #e2e8f0' }}>
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
            Employee Salary Roster
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Live compensation records from backend database (10,000 employees)
          </Typography>
        </Box>
      </Box>

      {/* Loading Indicator */}
      {isLoading && <LinearProgress sx={{ height: 3 }} />}

      {/* Table Container */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {/* Name Column */}
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'name'}
                  direction={sortBy === 'name' ? sortOrder : 'asc'}
                  onClick={() => onSortChange('name')}
                >
                  Employee
                </TableSortLabel>
              </TableCell>

              {/* Department Column */}
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'department'}
                  direction={sortBy === 'department' ? sortOrder : 'asc'}
                  onClick={() => onSortChange('department')}
                >
                  Department
                </TableSortLabel>
              </TableCell>

              {/* Country Column */}
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'country'}
                  direction={sortBy === 'country' ? sortOrder : 'asc'}
                  onClick={() => onSortChange('country')}
                >
                  Country
                </TableSortLabel>
              </TableCell>

              {/* Job Title */}
              <TableCell>Job Title</TableCell>

              {/* Base Salary */}
              <TableCell align="right">
                <TableSortLabel
                  active={sortBy === 'salary'}
                  direction={sortBy === 'salary' ? sortOrder : 'desc'}
                  onClick={() => onSortChange('salary')}
                >
                  Base Salary
                </TableSortLabel>
              </TableCell>
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
                    {/* Employee Profile */}
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
                    {isLoading ? 'Loading employee records from database...' : 'No employees found matching the search criteria.'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={totalRecords}
        rowsPerPage={pageSize}
        page={currentPage - 1} // MUI uses 0-based page index
        onPageChange={(_, newPage) => onPageChange(newPage + 1)}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
        sx={{
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#ffffff'
        }}
      />
    </Paper>
  )
}
