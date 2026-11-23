import React, { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material'
import type { Employee } from './types'

// Initial sample employee records
const initialEmployees: Employee[] = [
  {
    id: '1',
    name: 'Sarah Connor',
    email: 'sarah.c@acme.com',
    department: 'Engineering',
    country: 'United States',
    jobTitle: 'Senior Software Engineer',
    salary: 125000,
    currency: 'USD'
  },
  {
    id: '2',
    name: 'Rajesh Sharma',
    email: 'rajesh.s@acme.com',
    department: 'Engineering',
    country: 'India',
    jobTitle: 'Lead Architect',
    salary: 3200000,
    currency: 'INR'
  },
  {
    id: '3',
    name: 'Emma Watson',
    email: 'emma.w@acme.com',
    department: 'Product',
    country: 'United Kingdom',
    jobTitle: 'Product Manager',
    salary: 82000,
    currency: 'GBP'
  },
  {
    id: '4',
    name: 'Hans Gruber',
    email: 'hans.g@acme.com',
    department: 'Finance',
    country: 'Germany',
    jobTitle: 'Financial Analyst',
    salary: 68000,
    currency: 'EUR'
  },
  {
    id: '5',
    name: 'Kenji Sato',
    email: 'kenji.s@acme.com',
    department: 'Sales',
    country: 'Japan',
    jobTitle: 'Sales Director',
    salary: 11000000,
    currency: 'JPY'
  }
]

export default function App() {
  const [employees] = useState<Employee[]>(initialEmployees)

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          PayPulse — Salary Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Employee compensation records across global offices
        </Typography>
      </Box>

      {/* Basic Employee Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Country</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Job Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Salary</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.id} hover>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="600">
                    {emp.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {emp.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={emp.department} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{emp.country}</TableCell>
                <TableCell>{emp.jobTitle}</TableCell>
                <TableCell align="right" sx={{ fontWeight: '600' }}>
                  {emp.currency} {emp.salary.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  )
}
