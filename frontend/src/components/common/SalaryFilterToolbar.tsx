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
import { AppIcon } from '../../constants/icons'
import { DEPARTMENTS, COUNTRIES } from '../../constants/filters'

export interface SalaryFilterToolbarProps {
  searchInput: string
  onSearchInputChange: (value: string) => void
  onSearch: () => void
  appliedSearch?: string
  selectedDepartment: string
  onDepartmentChange: (department: string) => void
  selectedCountry: string
  onCountryChange: (country: string) => void
  totalCount: number
  onResetFilters: () => void
  onOpenAddEmployee?: () => void
  onExportCSV?: () => void
  isExporting?: boolean
  departments?: readonly string[]
  countries?: readonly string[]
}

export const SalaryFilterToolbar: React.FC<SalaryFilterToolbarProps> = ({
  searchInput,
  onSearchInputChange,
  onSearch,
  appliedSearch: _appliedSearch,
  selectedDepartment,
  onDepartmentChange,
  selectedCountry,
  onCountryChange,
  totalCount,
  onResetFilters,
  onOpenAddEmployee,
  onExportCSV,
  isExporting = false,
  departments = DEPARTMENTS,
  countries = COUNTRIES
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch()
    }
  }

  // Consistent sizing for action buttons (Rounded square, no circle or oval)
  const buttonSx = {
    height: 38,
    minWidth: 95,
    px: 2,
    fontWeight: 600,
    borderRadius: '8px', // Rounded square button
    textTransform: 'none',
    boxShadow: 'none',
    fontSize: '0.84rem'
  }

  const allDepartmentsList = ['ALL', ...departments]

  return (
    <Box sx={{ mb: 3 }}>
      {/* Category Filter Ribbon with Rounded Square Buttons */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          overflowX: 'auto',
          pb: 1.5,
          mb: 1,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' }
        }}
      >
        {allDepartmentsList.map((dept) => {
          const isSelected = selectedDepartment === dept
          const label = dept === 'ALL' ? 'All Departments' : dept

          return (
            <Button
              key={dept}
              onClick={() => onDepartmentChange(dept)}
              size="small"
              sx={{
                px: 2,
                py: 0.6,
                minHeight: 32,
                borderRadius: '8px', // Clean rounded square
                fontSize: '0.8125rem',
                fontWeight: isSelected ? 700 : 500,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                backgroundColor: isSelected ? '#1e242e' : '#ffffff',
                color: isSelected ? '#ffffff' : '#475569',
                border: isSelected ? '1px solid #1e242e' : '1px solid #e2e8f0',
                '&:hover': {
                  backgroundColor: isSelected ? '#0f172a' : '#f1f5f9',
                  borderColor: isSelected ? '#0f172a' : '#cbd5e1'
                }
              }}
            >
              {label}
            </Button>
          )
        })}
      </Box>

      {/* Main Filter Action Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 1.75,
          borderRadius: '14px',
          border: '1px solid #eef1f6',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 1.5,
          alignItems: { xs: 'stretch', lg: 'center' },
          justifyContent: 'space-between'
        }}
      >
        {/* Left Filter Controls: Search Box + Country Dropdown + Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
          {/* 1. Search Box */}
          <TextField
            size="small"
            placeholder="Search employee, title, or email..."
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{
              minWidth: { xs: '100%', sm: 270 },
              flex: { sm: 1 },
              '& .MuiOutlinedInput-root': {
                height: 38,
                borderRadius: '10px',
                backgroundColor: '#f8fafc',
                fontSize: '0.84rem'
              }
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon={AppIcon.SEARCH} width="18" height="18" color="#64748b" />
                  </InputAdornment>
                ),
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => onSearchInputChange('')}>
                      <Icon icon={AppIcon.CLOSE} width="16" height="16" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }
            }}
          />

          {/* 2. Country Dropdown */}
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
            <InputLabel id="filter-country-label" sx={{ fontSize: '0.825rem' }}>
              Country
            </InputLabel>
            <Select
              labelId="filter-country-label"
              value={selectedCountry}
              label="Country"
              onChange={(e) => onCountryChange(e.target.value)}
              sx={{
                height: 38,
                borderRadius: '10px',
                backgroundColor: '#f8fafc',
                fontSize: '0.84rem'
              }}
            >
              <MenuItem value="ALL" sx={{ fontSize: '0.84rem' }}>
                All Countries
              </MenuItem>
              {countries.map((c) => (
                <MenuItem key={c} value={c} sx={{ fontSize: '0.84rem' }}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 3. Search Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={onSearch}
            sx={{
              ...buttonSx,
              backgroundColor: '#2563eb',
              '&:hover': { backgroundColor: '#1d4ed8' }
            }}
            startIcon={<Icon icon={AppIcon.SEARCH} width="16" height="16" />}
          >
            Search
          </Button>

          {/* 4. Reset Button */}
          <Button
            variant="outlined"
            color="inherit"
            onClick={onResetFilters}
            sx={{
              ...buttonSx,
              borderColor: '#e2e8f0',
              color: '#475569',
              backgroundColor: '#ffffff',
              '&:hover': {
                borderColor: '#cbd5e1',
                backgroundColor: '#f8fafc'
              }
            }}
            startIcon={<Icon icon={AppIcon.RESET} width="15" height="15" />}
          >
            Reset
          </Button>
        </Box>

        {/* Right: Export CSV, Add Employee Action & Results Count */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
          {onExportCSV && (
            <Button
              variant="outlined"
              onClick={onExportCSV}
              disabled={isExporting}
              sx={{
                ...buttonSx,
                borderColor: '#e2e8f0',
                color: '#1e242e',
                backgroundColor: '#ffffff',
                '&:hover': {
                  borderColor: '#cbd5e1',
                  backgroundColor: '#f8fafc'
                }
              }}
              startIcon={<Icon icon={AppIcon.EXPORT} width="16" height="16" />}
            >
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          )}

          {onOpenAddEmployee && (
            <Button
              variant="contained"
              onClick={onOpenAddEmployee}
              sx={{
                ...buttonSx,
                backgroundColor: '#ff5442', // iLovePDF Signature Coral/Red Accent
                color: '#ffffff',
                '&:hover': { backgroundColor: '#e03a29' }
              }}
              startIcon={<Icon icon={AppIcon.ADD_USER} width="16" height="16" />}
            >
              Add Employee
            </Button>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>
              Records:
            </Typography>
            <Chip
              label={totalCount.toLocaleString()}
              size="small"
              sx={{
                fontWeight: 700,
                backgroundColor: '#f1f5f9',
                color: '#1e242e',
                fontSize: '0.75rem',
                height: 24,
                borderRadius: '6px'
              }}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}
