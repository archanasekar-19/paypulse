import React from 'react'
import {
  Paper,
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  IconButton,
  Button
} from '@mui/material'
import { Icon } from '@iconify/react'
import { DEPARTMENTS, COUNTRIES } from '../../constants/filters'

export interface SalaryFilterToolbarProps {
  searchInput: string
  onSearchInputChange: (value: string) => void
  onSearch: () => void
  appliedSearch: string
  selectedDepartment: string
  onDepartmentChange: (department: string) => void
  selectedCountry: string
  onCountryChange: (country: string) => void
  totalCount: number
  onResetFilters: () => void
  departments?: readonly string[]
  countries?: readonly string[]
}

export const SalaryFilterToolbar: React.FC<SalaryFilterToolbarProps> = ({
  searchInput,
  onSearchInputChange,
  onSearch,
  selectedDepartment,
  onDepartmentChange,
  selectedCountry,
  onCountryChange,
  totalCount,
  onResetFilters,
  departments = DEPARTMENTS,
  countries = COUNTRIES
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch()
    }
  }

  // Consistent sizing for action buttons
  const buttonSx = {
    height: 40,
    minWidth: 105,
    px: 2,
    fontWeight: 600,
    textTransform: 'none',
    boxShadow: 'none'
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 3,
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 2,
        alignItems: { xs: 'stretch', lg: 'center' },
        justifyContent: 'space-between'
      }}
    >
      {/* Ordered Filter Controls: Search Box -> Department -> Country -> Search Button -> Reset Button */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
        {/* 1. Search Box */}
        <TextField
          size="small"
          placeholder="Search name, email, or role..."
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ minWidth: { xs: '100%', sm: 260 }, flex: { sm: 1 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon icon="solar:magnifer-linear" width="18" height="18" color="#64748b" />
              </InputAdornment>
            ),
            endAdornment: searchInput ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => onSearchInputChange('')}>
                  <Icon icon="solar:close-circle-linear" width="16" height="16" />
                </IconButton>
              </InputAdornment>
            ) : null
          }}
        />

        {/* 2. Department Dropdown */}
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
          <InputLabel id="filter-dept-label">Department</InputLabel>
          <Select
            labelId="filter-dept-label"
            value={selectedDepartment}
            label="Department"
            onChange={(e) => onDepartmentChange(e.target.value)}
          >
            <MenuItem value="ALL">All Departments</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 3. Country Dropdown */}
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
          <InputLabel id="filter-country-label">Country</InputLabel>
          <Select
            labelId="filter-country-label"
            value={selectedCountry}
            label="Country"
            onChange={(e) => onCountryChange(e.target.value)}
          >
            <MenuItem value="ALL">All Countries</MenuItem>
            {countries.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 4. Search Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={onSearch}
          sx={buttonSx}
          startIcon={<Icon icon="solar:magnifer-linear" width="18" height="18" />}
        >
          Search
        </Button>

        {/* 5. Reset Button (Exact same height and width as Search button) */}
        <Button
          variant="outlined"
          color="inherit"
          onClick={onResetFilters}
          sx={{
            ...buttonSx,
            borderColor: '#cbd5e1',
            color: '#475569',
            backgroundColor: '#f8fafc',
            '&:hover': {
              borderColor: '#94a3b8',
              backgroundColor: '#f1f5f9'
            }
          }}
          startIcon={<Icon icon="solar:restart-linear" width="16" height="16" />}
        >
          Reset
        </Button>
      </Box>

      {/* Right: Results Count */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          Total Records:
        </Typography>
        <Chip
          label={totalCount.toLocaleString()}
          size="small"
          sx={{
            fontWeight: 700,
            backgroundColor: '#f1f5f9',
            color: '#0f172a',
            fontSize: '0.75rem'
          }}
        />
      </Box>
    </Paper>
  )
}
