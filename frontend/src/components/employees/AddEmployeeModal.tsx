import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material'
import { Icon } from '@iconify/react'
import { AppIcon } from '../../constants/icons'
import { DEPARTMENTS, COUNTRIES } from '../../constants/filters'
import type { Employee } from '../../types'

export interface EmployeeFormData {
  employeeCode?: string
  firstName: string
  lastName: string
  email: string
  department: string
  country: string
  jobTitle: string
  baseSalary: number
}

interface AddEmployeeModalProps {
  open: boolean
  onClose: () => void
  employee?: Employee | null
  onSubmit?: (employeeData: EmployeeFormData) => Promise<void>
  onAdd?: (employeeData: EmployeeFormData) => Promise<void>
}

const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  'United States': 'USD',
  'United Kingdom': 'GBP',
  Germany: 'EUR',
  India: 'INR',
  Japan: 'JPY',
  Singapore: 'SGD',
  Canada: 'CAD'
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'SGD', 'CAD']

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  open,
  onClose,
  employee,
  onSubmit,
  onAdd
}) => {
  const isEditMode = Boolean(employee)

  const [employeeCode, setEmployeeCode] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('Engineering')
  const [country, setCountry] = useState('United States')
  const [currency, setCurrency] = useState('USD')
  const [jobTitle, setJobTitle] = useState('')
  const [baseSalary, setBaseSalary] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate data when editing an existing employee or reset for add mode
  useEffect(() => {
    if (open) {
      if (employee) {
        const names = (employee.name || '').trim().split(' ')
        setEmployeeCode(employee.employeeCode || '')
        setFirstName(employee.firstName || names[0] || '')
        setLastName(employee.lastName || (names.length > 1 ? names.slice(1).join(' ') : ''))
        setEmail(employee.email || '')
        setDepartment(employee.department || 'Engineering')
        setCountry(employee.country || 'United States')
        setCurrency(employee.currency || COUNTRY_CURRENCY_MAP[employee.country] || 'USD')
        setJobTitle(employee.jobTitle || '')
        setBaseSalary(employee.salary ? String(employee.salary) : '')
        setError(null)
      } else {
        setEmployeeCode('')
        setFirstName('')
        setLastName('')
        setEmail('')
        setDepartment('Engineering')
        setCountry('United States')
        setCurrency('USD')
        setJobTitle('')
        setBaseSalary('')
        setError(null)
      }
    }
  }, [open, employee])

  // When country changes, automatically sync its default currency
  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry)
    const defaultCurr = COUNTRY_CURRENCY_MAP[newCountry] || 'USD'
    setCurrency(defaultCurr)
  }

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !jobTitle.trim() || !baseSalary) {
      setError('Please fill out all required fields')
      return
    }

    const salaryNum = Number(baseSalary)
    if (isNaN(salaryNum) || salaryNum <= 0) {
      setError('Salary must be a positive number')
      return
    }

    const action = onSubmit || onAdd
    if (!action) return

    try {
      setIsSubmitting(true)
      setError(null)
      await action({
        employeeCode: employeeCode.trim() || undefined,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        department,
        country,
        jobTitle: jobTitle.trim(),
        baseSalary: salaryNum
      })
      setIsSubmitting(false)
      onClose()
    } catch (err: any) {
      setIsSubmitting(false)
      setError(err?.message || (isEditMode ? 'Failed to update employee' : 'Failed to onboard employee'))
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <Icon
          icon={isEditMode ? AppIcon.EDIT : AppIcon.ADD_USER_DUOTONE}
          width="24"
          height="24"
          color="#2563eb"
        />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {isEditMode ? 'Edit Employee Record' : 'Add New Employee Record'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {error}
          </Alert>
        )}

        {/* 100% Symmetrical 2-Column Grid: Exactly 2 equal-width fields per row */}
        <Grid container spacing={2.5}>
          {/* Row 1: First Name & Last Name */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="First Name"
              size="small"
              fullWidth
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Last Name"
              size="small"
              fullWidth
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Grid>

          {/* Row 2: Work Email & Employee Code */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Work Email"
              type="email"
              size="small"
              fullWidth
              required
              placeholder="name@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Employee Code"
              size="small"
              fullWidth
              placeholder="Auto-assigned (e.g. ACM-01528)"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              helperText="Optional; auto-assigned if left blank"
            />
          </Grid>

          {/* Row 3: Department & Job Title */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl size="small" fullWidth required>
              <InputLabel id="add-dept-label">Department</InputLabel>
              <Select
                labelId="add-dept-label"
                value={department}
                label="Department"
                onChange={(e) => setDepartment(e.target.value)}
              >
                {DEPARTMENTS.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Job Title"
              size="small"
              fullWidth
              required
              placeholder="e.g. Senior Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </Grid>

          {/* Row 4: Country & Currency */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl size="small" fullWidth required>
              <InputLabel id="add-country-label">Country</InputLabel>
              <Select
                labelId="add-country-label"
                value={country}
                label="Country"
                onChange={(e) => handleCountryChange(e.target.value)}
              >
                {COUNTRIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl size="small" fullWidth required>
              <InputLabel id="add-currency-label">Currency</InputLabel>
              <Select
                labelId="add-currency-label"
                value={currency}
                label="Currency"
                onChange={(e) => setCurrency(e.target.value)}
              >
                {CURRENCIES.map((curr) => (
                  <MenuItem key={curr} value={curr}>
                    {curr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Row 5: Starting / Base Salary */}
          <Grid size={{ xs: 12 }}>
            <TextField
              label={isEditMode ? 'Annual Base Salary' : 'Starting Base Salary'}
              type="number"
              size="small"
              fullWidth
              required
              placeholder="e.g. 125000"
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Icon
                icon={isEditMode ? AppIcon.CHECK : AppIcon.ADD_USER}
                width="18"
                height="18"
              />
            )
          }
        >
          {isSubmitting
            ? isEditMode
              ? 'Saving Changes...'
              : 'Onboarding Employee...'
            : isEditMode
            ? 'Save Changes'
            : 'Add Employee'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
