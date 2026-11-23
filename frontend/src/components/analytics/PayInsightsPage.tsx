import React, { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import { Icon } from '@iconify/react'
import { AppIcon } from '../../constants/icons'
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters'
import type { DeepDivePayInsights } from '../../types'

interface PayInsightsPageProps {
  insights: DeepDivePayInsights | null
  isLoading: boolean
  error: string | null
  selectedCountry: string
  onCountryChange: (country: string) => void
  thresholdPercent: number
  onThresholdChange: (threshold: number) => void
  onBackToRoster: () => void
  onViewEmployeePaySlip?: (employeeId: string) => void
}

const COUNTRIES = [
  'All',
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Germany',
  'Japan',
  'Singapore'
]

export const PayInsightsPage: React.FC<PayInsightsPageProps> = ({
  insights,
  isLoading,
  error,
  selectedCountry,
  onCountryChange,
  thresholdPercent,
  onThresholdChange,
  onBackToRoster
}) => {
  // Sub-filter for Role table
  const [roleSearch, setRoleSearch] = useState('')
  const [roleDeptFilter, setRoleDeptFilter] = useState('All')

  // Outlier filter tabs: 'ALL' | 'BELOW_BAND' | 'ABOVE_BAND'
  const [outlierFilter, setOutlierFilter] = useState<'ALL' | 'BELOW_BAND' | 'ABOVE_BAND'>('ALL')

  // Filtered roles by search and department
  const filteredRoles = useMemo(() => {
    if (!insights?.byDepartmentTitle) return []
    return insights.byDepartmentTitle.filter((item) => {
      const matchesSearch =
        item.jobTitle.toLowerCase().includes(roleSearch.toLowerCase()) ||
        item.department.toLowerCase().includes(roleSearch.toLowerCase())
      const matchesDept = roleDeptFilter === 'All' || item.department === roleDeptFilter
      return matchesSearch && matchesDept
    })
  }, [insights?.byDepartmentTitle, roleSearch, roleDeptFilter])

  // Unique departments for filter
  const departments = useMemo(() => {
    if (!insights?.byDepartmentTitle) return ['All']
    const depts = Array.from(new Set(insights.byDepartmentTitle.map((r) => r.department)))
    return ['All', ...depts]
  }, [insights?.byDepartmentTitle])

  // Filtered outliers
  const filteredOutliers = useMemo(() => {
    if (!insights?.outliers?.items) return []
    if (outlierFilter === 'ALL') return insights.outliers.items
    return insights.outliers.items.filter((item) => item.outlierStatus === outlierFilter)
  }, [insights?.outliers?.items, outlierFilter])

  if (isLoading && !insights) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12 }}>
        <CircularProgress size={42} sx={{ color: '#ff5442', mb: 2 }} />
        <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
          Calculating compensation benchmarks and SQL pay distributions...
        </Typography>
      </Box>
    )
  }

  if (error || !insights) {
    return (
      <Box sx={{ py: 6, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Unable to load executive pay insights. Please check backend connection.'}
        </Alert>
        <Button variant="outlined" onClick={onBackToRoster}>
          Back to Payroll Roster
        </Button>
      </Box>
    )
  }

  const { overview, byCountry, distribution, outliers } = insights

  // Format data for Country comparison bar chart (Median vs Average)
  const countryChartData = byCountry.map((c) => ({
    country: c.country,
    'Median Salary': c.medianSalaryUSD,
    'Average Salary': c.avgSalaryUSD,
    headcount: c.headcount,
    currency: c.currency
  }))

  // Format data for Distribution Histogram chart
  const histogramChartData = distribution.histogram.map((bin) => ({
    band: bin.bandLabel,
    Employees: bin.count,
    avgPay: bin.avgSalaryUSD
  }))

  return (
    <Box sx={{ width: '100%', pb: 8 }}>
      {/* Top Breadcrumb & Country Filter Header */}
      <Box
        sx={{
          mb: 3.5,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Button
              size="small"
              onClick={onBackToRoster}
              startIcon={<Icon icon="solar:arrow-left-linear" width="16" height="16" />}
              sx={{
                color: '#64748b',
                p: 0,
                minWidth: 'auto',
                fontWeight: 600,
                fontSize: '0.8125rem',
                '&:hover': { background: 'none', color: '#1e242e' }
              }}
            >
              Back to Payroll Roster
            </Button>
            <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
              /
            </Typography>
            <Chip
              label="Live Database SQL Analytics"
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                borderRadius: '6px'
              }}
            />
          </Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: '#1e242e', letterSpacing: '-0.025em', fontSize: { xs: '1.5rem', sm: '1.85rem' } }}
          >
            Deep Dive Pay Insights
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
            Multi-currency compensation benchmarks, role pay bands, salary distribution, and equity outliers
          </Typography>
        </Box>

        {/* Global Geographic Scope Selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, mr: 0.5 }}>
            Country Scope:
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {COUNTRIES.map((c) => {
              const isSelected = selectedCountry === c
              return (
                <Chip
                  key={c}
                  label={c}
                  size="small"
                  onClick={() => onCountryChange(c)}
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    height: 28,
                    backgroundColor: isSelected ? '#1e242e' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#475569',
                    border: isSelected ? '1px solid #1e242e' : '1px solid #e2e8f0',
                    '&:hover': {
                      backgroundColor: isSelected ? '#0f172a' : '#f1f5f9'
                    }
                  }}
                />
              )
            })}
          </Box>
        </Box>
      </Box>

      {/* SECTION 1: Org Overview KPI Cards & Why Median Matters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2.25, borderRadius: '12px', border: '1px solid #eef1f6', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon icon={AppIcon.HEADCOUNT} width="18" height="18" />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                  ACTIVE HEADCOUNT
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e242e', mb: 0.25 }}>
                {overview.headcount.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Full-time global staff
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2.25, borderRadius: '12px', border: '1px solid #eef1f6', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: '#fff0ee',
                    color: '#ff5442',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon icon={AppIcon.PAYROLL} width="18" height="18" />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                  TOTAL PAYROLL COST
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e242e', mb: 0.25 }}>
                {formatCompactCurrency(overview.totalPayrollUSD, 'USD')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Annualized in reporting USD
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 2.25,
                borderRadius: '12px',
                border: '2px solid #bfdbfe',
                backgroundColor: '#f8fafc',
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon icon={AppIcon.TARGET} width="18" height="18" />
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e242e' }}>
                    MEDIAN SALARY (P50)
                  </Typography>
                </Box>
                <Chip
                  label="Primary Metric"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    borderRadius: '4px'
                  }}
                />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#2563eb', mb: 0.25 }}>
                {formatCurrency(overview.medianSalaryUSD, 'USD')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500 }}>
                Typical employee midpoint
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2.25, borderRadius: '12px', border: '1px solid #eef1f6', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon icon={AppIcon.SCALE} width="18" height="18" />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                  AVERAGE SALARY
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e242e', mb: 0.25 }}>
                {formatCurrency(overview.avgSalaryUSD, 'USD')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Mathematical mean across all roles
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Non-Technical Plain-English Insight Banner */}
        <Paper
          sx={{
            mt: 2,
            p: 2,
            borderRadius: '10px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5
          }}
        >
          <Box sx={{ color: '#2563eb', mt: 0.25 }}>
            <Icon icon={AppIcon.INFO} width="20" height="20" />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 0.25, fontSize: '0.84rem' }}>
              Why Median is our primary benchmark instead of Average
            </Typography>
            <Typography variant="body2" sx={{ color: '#1e40af', fontSize: '0.8rem', lineHeight: 1.45 }}>
              In compensation data, a few high executive salaries pull the mathematical average up, making standard pay look higher than it really is. The <strong>median (P50)</strong> identifies the exact middle earner, giving HR and managers the true picture of what standard employees are paid.
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* SECTION 2: By Country (Recharts Bar Chart & Detailed Breakdown Table) */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: '14px', border: '1px solid #eef1f6' }}>
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Icon icon={AppIcon.BUILDINGS} width="20" height="20" color="#ff5442" />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e242e' }}>
              Compensation by Operating Country
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Headcount, min, median, average, and total annual payroll spend across our 7 regional hubs
          </Typography>
        </Box>

        {/* Recharts Bar Chart: Median vs Average Salary by Country */}
        <Box sx={{ height: 320, width: '100%', mb: 3 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countryChartData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="country" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(val) => `USD ${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  fontSize: '0.8rem'
                }}
                formatter={(value: any) => [`USD ${Number(value).toLocaleString()}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
              <Bar dataKey="Median Salary" fill="#2563eb" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Average Salary" fill="#93c5fd" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Country Breakdown Table */}
        <TableContainer sx={{ border: '1px solid #f1f5f9', borderRadius: '10px' }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Country</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Currency</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Headcount</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Min Salary</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#2563eb' }}>Median Salary (Local)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Average Salary</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Max Salary</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#1e242e' }}>Total Spend (USD)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {byCountry.map((c) => (
                <TableRow key={c.country} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={{ fontWeight: 700, color: '#1e242e' }}>{c.country}</TableCell>
                  <TableCell>
                    <Chip
                      label={c.currency}
                      size="small"
                      sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, borderRadius: '4px', backgroundColor: '#f8fafc' }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{c.headcount.toLocaleString()}</TableCell>
                  <TableCell align="right" sx={{ color: '#64748b' }}>
                    {formatCurrency(c.minSalaryLocal, c.currency)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#2563eb' }}>
                    {formatCurrency(c.medianSalaryLocal, c.currency)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#64748b' }}>
                    {formatCurrency(c.avgSalaryLocal, c.currency)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#64748b' }}>
                    {formatCurrency(c.maxSalaryLocal, c.currency)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#1e242e' }}>
                    {formatCompactCurrency(c.totalCostUSD, 'USD')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Plain-English Geographic Insight */}
        <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
          <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}>
            💡 <strong>Geographic Takeaway:</strong> The United States and United Kingdom represent our highest compensation markets per headcount, while India and Japan provide our largest technical engineering scale at competitive market rates.
          </Typography>
        </Box>
      </Paper>

      {/* SECTION 3: By Department & Job Title within Country ("What do Senior Engineers in India earn?") */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: '14px', border: '1px solid #eef1f6' }}>
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Icon icon={AppIcon.CHART} width="20" height="20" color="#ff5442" />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e242e' }}>
              Role Pay Bands & Benchmarks by Country
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Answers key HR questions like <em>"What do Senior Engineers in India earn?"</em> with P25, Median, and P75 salary bands
          </Typography>
        </Box>

        {/* Filter Controls: Role Search + Department Filter */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2.5
          }}
        >
          <TextField
            size="small"
            placeholder="Search job title (e.g. Senior Engineer, Product Manager)..."
            value={roleSearch}
            onChange={(e) => setRoleSearch(e.target.value)}
            sx={{
              minWidth: { xs: '100%', sm: 320 },
              '& .MuiOutlinedInput-root': {
                height: 38,
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                fontSize: '0.84rem'
              }
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon={AppIcon.SEARCH} width="16" height="16" color="#64748b" />
                  </InputAdornment>
                )
              }
            }}
          />

          {/* Department Filter Chips */}
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
            {departments.slice(0, 6).map((dept) => {
              const isSelected = roleDeptFilter === dept
              return (
                <Chip
                  key={dept}
                  label={dept}
                  size="small"
                  onClick={() => setRoleDeptFilter(dept)}
                  sx={{
                    height: 28,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#ff5442' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#475569',
                    border: isSelected ? '1px solid #ff5442' : '1px solid #e2e8f0',
                    '&:hover': {
                      backgroundColor: isSelected ? '#e03a29' : '#f1f5f9'
                    }
                  }}
                />
              )
            })}
          </Box>
        </Box>

        {/* Roles Table with P25, Median, P75 Bands */}
        <TableContainer sx={{ border: '1px solid #f1f5f9', borderRadius: '10px', maxHeight: 420 }}>
          <Table size="small" stickyHeader>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Job Title</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Country</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Staff Count</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Min Salary</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>25th %ile (P25)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#2563eb' }}>Median (P50)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>75th %ile (P75)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Max Salary</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRoles.slice(0, 30).map((r, idx) => (
                <TableRow key={`${r.country}-${r.jobTitle}-${idx}`} hover>
                  <TableCell sx={{ fontWeight: 700, color: '#1e242e' }}>{r.jobTitle}</TableCell>
                  <TableCell>
                    <Chip
                      label={r.department}
                      size="small"
                      sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, borderRadius: '4px', backgroundColor: '#f1f5f9' }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#475569', fontSize: '0.8rem' }}>{r.country}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{r.headcount}</TableCell>
                  <TableCell align="right" sx={{ color: '#94a3b8' }}>{formatCurrency(r.minSalary, r.currency)}</TableCell>
                  <TableCell align="right" sx={{ color: '#475569' }}>{formatCurrency(r.p25Salary, r.currency)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#2563eb' }}>
                    {formatCurrency(r.medianSalary, r.currency)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#475569' }}>{formatCurrency(r.p75Salary, r.currency)}</TableCell>
                  <TableCell align="right" sx={{ color: '#94a3b8' }}>{formatCurrency(r.maxSalary, r.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Practical Hiring Rule of Thumb Insight */}
        <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
          <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}>
            💡 <strong>Hiring & Promotion Rule of Thumb:</strong> When extending offers or promoting staff, target between the <strong>25th percentile (P25)</strong> and <strong>Median (P50)</strong> for standard hires, and up to the <strong>75th percentile (P75)</strong> for high-demand senior talent. Paying above P75 should require executive justification.
          </Typography>
        </Box>
      </Paper>

      {/* SECTION 4: Salary Distribution & Percentiles (Recharts Histogram Bar Chart & Percentile Ladder) */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: '14px', border: '1px solid #eef1f6' }}>
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Icon icon={AppIcon.TRENDING_UP} width="20" height="20" color="#ff5442" />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e242e' }}>
              Salary Distribution & Percentile Bands
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Global distribution of employee base salaries in normalized USD compensation tiers
          </Typography>
        </Box>

        {/* Percentile Bands Ladder Cards */}
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          {[
            { label: 'P10 (Entry Floor)', value: distribution.percentiles.p10, desc: 'Lowest 10% threshold' },
            { label: 'P25 (Lower Band)', value: distribution.percentiles.p25, desc: '25% earn below this' },
            { label: 'P50 (Median Pay)', value: distribution.percentiles.p50, desc: 'Exact middle employee', highlight: true },
            { label: 'P75 (Upper Band)', value: distribution.percentiles.p75, desc: '75% earn below this' },
            { label: 'P90 (Senior Tier)', value: distribution.percentiles.p90, desc: 'Top 10% threshold' }
          ].map((tier) => (
            <Grid key={tier.label} size={{ xs: 6, sm: 4, md: 2.4 }}>
              <Paper
                sx={{
                  p: 1.5,
                  borderRadius: '10px',
                  backgroundColor: tier.highlight ? '#eff6ff' : '#f8fafc',
                  border: tier.highlight ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  textAlign: 'center'
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, color: tier.highlight ? '#2563eb' : '#64748b', display: 'block' }}>
                  {tier.label}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: tier.highlight ? '#1e3a8a' : '#1e242e', my: 0.25 }}>
                  {formatCurrency(tier.value, 'USD')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                  {tier.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Recharts Bar Chart: Salary Distribution Histogram */}
        <Box sx={{ height: 280, width: '100%', mb: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramChartData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="band" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  fontSize: '0.8rem'
                }}
                formatter={(value: any) => [`${value} Employees`, 'Workforce']}
              />
              <Bar dataKey="Employees" fill="#ff5442" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Distribution Insight */}
        <Box sx={{ p: 1.5, backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
          <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}>
            💡 <strong>Distribution Takeaway:</strong> The middle 50% of our global workforce earns between <strong>{formatCurrency(distribution.percentiles.p25, 'USD')}</strong> and <strong>{formatCurrency(distribution.percentiles.p75, 'USD')}</strong>. The bell curve indicates a healthy, balanced pay pyramid without acute wage compression.
          </Typography>
        </Box>
      </Paper>

      {/* SECTION 5: Outlier Detection (Actionable Compensation Disparities Table) */}
      <Paper sx={{ p: 3, borderRadius: '14px', border: '1px solid #eef1f6' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 2.5
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Icon icon={AppIcon.DANGER} width="20" height="20" color="#ef4444" />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e242e' }}>
                Actionable Outlier Detection (Title + Country Benchmarks)
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Identifies employees paid outside ±{thresholdPercent}% of the median for their role in that country
            </Typography>
          </Box>

          {/* Threshold Selector & Summary Badges */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                Band Sensitivity:
              </Typography>
              <ToggleButtonGroup
                size="small"
                value={thresholdPercent}
                exclusive
                onChange={(_, val) => val && onThresholdChange(val)}
                sx={{ height: 28 }}
              >
                <ToggleButton value={15} sx={{ px: 1, fontSize: '0.75rem', fontWeight: 700 }}>
                  ±15%
                </ToggleButton>
                <ToggleButton value={20} sx={{ px: 1, fontSize: '0.75rem', fontWeight: 700 }}>
                  ±20%
                </ToggleButton>
                <ToggleButton value={25} sx={{ px: 1, fontSize: '0.75rem', fontWeight: 700 }}>
                  ±25%
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
        </Box>

        {/* Action Summary Pill Cards */}
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper
              sx={{
                p: 1.75,
                borderRadius: '10px',
                backgroundColor: '#fff0ee',
                border: '1px solid #ffd6d1',
                cursor: 'pointer'
              }}
              onClick={() => setOutlierFilter('BELOW_BAND')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#e03a29' }}>
                  BELOW BAND (RETENTION RISK)
                </Typography>
                <Chip
                  label={outliers.summary.belowBandCount}
                  size="small"
                  sx={{ backgroundColor: '#ff5442', color: '#ffffff', fontWeight: 800, height: 22 }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: '#991b1b', fontSize: '0.78rem', mt: 0.5 }}>
                Paid &gt;{thresholdPercent}% below peer median in role
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper
              sx={{
                p: 1.75,
                borderRadius: '10px',
                backgroundColor: '#fffbeb',
                border: '1px solid #fef3c7',
                cursor: 'pointer'
              }}
              onClick={() => setOutlierFilter('ABOVE_BAND')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#b45309' }}>
                  ABOVE BAND (COMPENSATION AUDIT)
                </Typography>
                <Chip
                  label={outliers.summary.aboveBandCount}
                  size="small"
                  sx={{ backgroundColor: '#f59e0b', color: '#ffffff', fontWeight: 800, height: 22 }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: '#92400e', fontSize: '0.78rem', mt: 0.5 }}>
                Paid &gt;{thresholdPercent}% above peer median in role
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper
              sx={{
                p: 1.75,
                borderRadius: '10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer'
              }}
              onClick={() => setOutlierFilter('ALL')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                  TOTAL OUTLIERS DETECTED
                </Typography>
                <Chip
                  label={outliers.summary.totalOutliers}
                  size="small"
                  sx={{ backgroundColor: '#475569', color: '#ffffff', fontWeight: 800, height: 22 }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.78rem', mt: 0.5 }}>
                {outlierFilter === 'ALL' ? 'Showing all flagged records' : `Filter: ${outlierFilter} (Click to reset)`}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Outlier Records Table */}
        <TableContainer sx={{ border: '1px solid #f1f5f9', borderRadius: '10px', maxHeight: 420 }}>
          <Table size="small" stickyHeader>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Role & Dept</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Country</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Current Salary</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#2563eb' }}>Peer Median</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Deviation %</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Recommended HR Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOutliers.slice(0, 35).map((item) => {
                const isBelow = item.outlierStatus === 'BELOW_BAND'
                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e242e', fontSize: '0.8125rem' }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                        {item.employeeCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.8rem' }}>
                        {item.jobTitle}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                        {item.department}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '0.8rem' }}>{item.country}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: isBelow ? '#ef4444' : '#b45309' }}>
                      {formatCurrency(item.baseSalary, item.currency)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#2563eb' }}>
                      {formatCurrency(item.benchmarkMedian, item.currency)}
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        size="small"
                        icon={<Icon icon={isBelow ? AppIcon.ARROW_DOWN : AppIcon.ARROW_UP} width="12" height="12" />}
                        label={`${item.deviationPercent > 0 ? '+' : ''}${item.deviationPercent}%`}
                        sx={{
                          height: 22,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: isBelow ? '#fee2e2' : '#fef3c7',
                          color: isBelow ? '#dc2626' : '#d97706',
                          borderRadius: '4px'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={isBelow ? 'BELOW BAND' : 'ABOVE BAND'}
                        sx={{
                          height: 22,
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          borderRadius: '4px',
                          backgroundColor: isBelow ? '#fff0ee' : '#fffbeb',
                          color: isBelow ? '#ff5442' : '#d97706',
                          border: isBelow ? '1px solid #ffc7c2' : '1px solid #fde68a'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', color: '#475569' }}>
                      {isBelow
                        ? 'Candidate for market equity raise'
                        : 'Review role band or senior compensation rationale'}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Actionable HR Outlier Insight */}
        <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
          <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}>
            💡 <strong>Directly Actionable HR Next Steps:</strong> Employees marked <strong>BELOW BAND</strong> represent immediate flight risk and compensation equity concerns. Prioritize these records for off-cycle adjustments during the next review.
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}
