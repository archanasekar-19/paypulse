import type React from 'react'
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
  IconButton,
  Tooltip,
  LinearProgress,
  CircularProgress
} from '@mui/material'
import { Icon } from '@iconify/react'
import { AppIcon } from '../../constants/icons'
import type { Employee } from '../../types'
import { formatCurrency, getInitials } from '../../utils/formatters'
import { getDepartmentStyle } from '../../constants/departments'

interface EmployeeTableProps {
  employees: Employee[]
  totalRecords: number
  currentPage: number
  pageSize: number
  sortBy: 'salary' | 'name' | 'department' | 'country' | 'hireDate' | 'updatedAt'
  sortOrder: 'asc' | 'desc'
  isLoading?: boolean
  onPageChange: (newPage: number) => void
  onPageSizeChange: (newPageSize: number) => void
  onSortChange: (column: 'salary' | 'name' | 'department' | 'country' | 'hireDate' | 'updatedAt') => void
  onViewPaySlip?: (employee: Employee) => void
  onViewHistory?: (employee: Employee) => void
  onEditEmployee: (employee: Employee) => void
  onDeleteEmployee: (employee: Employee) => void
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
  onSortChange,
  onViewPaySlip,
  onViewHistory,
  onEditEmployee,
  onDeleteEmployee
}) => {
  return (
    <Paper elevation={0} sx={{ overflow: 'hidden', border: '1px solid #eef1f6', borderRadius: '14px' }}>
      {/* Table Header Section */}
      <Box
        sx={{
          py: 1.5,
          px: 2.25,
          borderBottom: '1px solid #eef1f6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff'
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e242e', fontSize: '1rem', lineHeight: 1.2 }}>
            Employee Salary Roster
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
            Active compensation records and payroll details
          </Typography>
        </Box>
      </Box>

      {/* Loading Indicator */}
      {isLoading && <LinearProgress sx={{ height: 3 }} />}

      {/* Table Container with Loading Overlay */}
      <TableContainer sx={{ position: 'relative', minHeight: 340 }}>
        {/* Semi-transparent Loading Overlay during page change, sort, filter, or CRUD refresh */}
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.72)',
              zIndex: 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              backdropFilter: 'blur(1px)'
            }}
          >
            <CircularProgress size={38} thickness={4} color="primary" />
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Fetching employee records...
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Querying live database
            </Typography>
          </Box>
        )}

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

              {/* Base Salary Column */}
              <TableCell align="right">
                <TableSortLabel
                  active={sortBy === 'salary'}
                  direction={sortBy === 'salary' ? sortOrder : 'desc'}
                  onClick={() => onSortChange('salary')}
                >
                  Base Salary
                </TableSortLabel>
              </TableCell>

              {/* Actions Column */}
              <TableCell align="center" sx={{ width: 135 }}>
                Actions
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
                      opacity: emp.status === 'INACTIVE' ? 0.78 : 1,
                      backgroundColor: emp.status === 'INACTIVE' ? '#fafafa' : 'inherit',
                      '&:hover': { backgroundColor: emp.status === 'INACTIVE' ? '#f1f5f9' : '#f8fafc' },
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Employee Profile */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '8px',
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            backgroundColor: emp.status === 'INACTIVE' ? '#e2e8f0' : '#f1f5f9',
                            color: emp.status === 'INACTIVE' ? '#64748b' : '#334155',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                color: emp.status === 'INACTIVE' ? '#64748b' : 'text.primary'
                              }}
                            >
                              {emp.name}
                            </Typography>
                            {emp.status === 'INACTIVE' && (
                              <Box
                                component="span"
                                sx={{
                                  px: 0.75,
                                  py: 0.15,
                                  borderRadius: '4px',
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  letterSpacing: '0.03em',
                                  textTransform: 'uppercase',
                                  backgroundColor: '#fee2e2',
                                  color: '#dc2626',
                                  border: '1px solid #fecaca',
                                  lineHeight: 1.2
                                }}
                              >
                                Inactive
                              </Box>
                            )}
                          </Box>
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
                          px: 1.25,
                          py: 0.35,
                          borderRadius: '6px', // Clean rounded square badge
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: deptStyle.bg,
                          color: deptStyle.color,
                          border: `1px solid ${deptStyle.border}`,
                          lineHeight: 1.2
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

                    {/* Salary: Base Salary as primary, Take-Home below */}
                    <TableCell align="right">
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }} color="text.primary">
                        {formatCurrency(emp.baseSalary || emp.salary, emp.currency)}
                      </Typography>
                      {Boolean(emp.netSalary) && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: '#16a34a'
                          }}
                        >
                          Take-Home: {formatCurrency(emp.netSalary!, emp.currency)}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Actions: View Pay Slip, Edit, Delete (iLovePDF Soft Rounded Square Buttons) */}
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.75, justifyContent: 'center' }}>
                        {onViewPaySlip && (
                          <Tooltip title="View Compensation Slip & Welfare Breakdown">
                            <IconButton
                              size="small"
                              onClick={() => onViewPaySlip(emp)}
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: '8px',
                                backgroundColor: '#e8f8f0',
                                color: '#10b981',
                                '&:hover': { backgroundColor: '#d1fae5' }
                              }}
                            >
                              <Icon icon={AppIcon.PAYSLIP} width="16" height="16" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {onViewHistory && (
                          <Tooltip title="View Salary Revision Timeline & Audit Trail">
                            <IconButton
                              size="small"
                              onClick={() => onViewHistory(emp)}
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: '8px',
                                backgroundColor: '#fef3c7',
                                color: '#d97706',
                                '&:hover': { backgroundColor: '#fde68a' }
                              }}
                            >
                              <Icon icon={AppIcon.TIMELINE} width="16" height="16" />
                            </IconButton>
                          </Tooltip>
                        )}

                        <Tooltip title="Edit Record">
                          <IconButton
                            size="small"
                            onClick={() => onEditEmployee(emp)}
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius: '8px',
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              '&:hover': { backgroundColor: '#dbeafe' }
                            }}
                          >
                            <Icon icon={AppIcon.EDIT} width="16" height="16" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title={emp.status === 'INACTIVE' ? 'Employee is already inactive' : 'Deactivate Employee (Mark Inactive)'}>
                          <span>
                            <IconButton
                              size="small"
                              disabled={emp.status === 'INACTIVE'}
                              onClick={() => onDeleteEmployee(emp)}
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: '8px',
                                backgroundColor: emp.status === 'INACTIVE' ? '#f1f5f9' : '#fff0ee',
                                color: emp.status === 'INACTIVE' ? '#94a3b8' : '#ea580c',
                                '&:hover': { backgroundColor: emp.status === 'INACTIVE' ? '#f1f5f9' : '#fee2e2' }
                              }}
                            >
                              <Icon icon={AppIcon.USER_INACTIVE} width="16" height="16" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  {isLoading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                      <CircularProgress size={36} color="primary" />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        Loading employee records from database...
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No employees found matching the search criteria.
                    </Typography>
                  )}
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
