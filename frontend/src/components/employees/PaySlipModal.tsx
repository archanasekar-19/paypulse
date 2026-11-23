import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material'
import { Icon } from '@iconify/react'
import { AppIcon } from '../../constants/icons'
import type { Employee, CompensationUpdateData } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import { getDepartmentStyle } from '../../constants/departments'

const FX_RATES_TO_USD: Record<string, number> = {
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.28,
  INR: 0.012,
  JPY: 0.0067,
  SGD: 0.75,
  CAD: 0.74
}

// Standard full-time annual working days (52 weeks * 5 days)
const ANNUAL_WORKING_DAYS = 260

interface PaySlipModalProps {
  open: boolean
  employee: Employee | null
  onClose: () => void
  onSave?: (id: string, data: CompensationUpdateData) => Promise<void>
}

export const PaySlipModal: React.FC<PaySlipModalProps> = ({
  open,
  employee,
  onClose,
  onSave
}) => {
  // Editable Welfare Additions state
  const [baseSalary, setBaseSalary] = useState<string>('0')
  const [bonus, setBonus] = useState<string>('0')
  const [subsidy, setSubsidy] = useState<string>('0')
  const [allowance, setAllowance] = useState<string>('0')
  const [overtimePay, setOvertimePay] = useState<string>('0')

  // Attendance & Leave Tracking state
  const [earnedLeaves, setEarnedLeaves] = useState<string>('18')
  const [leaveDays, setLeaveDays] = useState<string>('0')
  const [autoCalculateLeave, setAutoCalculateLeave] = useState<boolean>(true)

  // Editable Wage Deductions state
  const [insurance, setInsurance] = useState<string>('0')
  const [leaveDeduction, setLeaveDeduction] = useState<string>('0')

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate data when dialog opens or employee changes
  useEffect(() => {
    if (open && employee) {
      const base = employee.baseSalary || employee.salary || 0
      const eLeaves = employee.earnedLeaves !== undefined ? employee.earnedLeaves : 18
      const lDays = employee.leaveDays !== undefined ? employee.leaveDays : 0

      setBaseSalary(String(base))
      setBonus(String(employee.bonus !== undefined ? employee.bonus : Math.round(base * 0.08)))
      setSubsidy(String(employee.subsidy !== undefined ? employee.subsidy : Math.round(base * 0.03)))
      setAllowance(String(employee.allowance !== undefined ? employee.allowance : Math.round(base * 0.04)))
      setOvertimePay(String(employee.overtimePay !== undefined ? employee.overtimePay : 0))

      setEarnedLeaves(String(eLeaves))
      setLeaveDays(String(lDays))
      setAutoCalculateLeave(true)

      setInsurance(String(employee.insurance !== undefined ? employee.insurance : Math.round(base * 0.065)))
      setLeaveDeduction(String(employee.leaveDeduction !== undefined ? employee.leaveDeduction : 0))
      setError(null)
    }
  }, [open, employee])

  // Mathematical & Financial Recalculations
  const numBase = Math.max(0, Number(baseSalary) || 0)
  const numBonus = Math.max(0, Number(bonus) || 0)
  const numSubsidy = Math.max(0, Number(subsidy) || 0)
  const numAllowance = Math.max(0, Number(allowance) || 0)
  const numOvertime = Math.max(0, Number(overtimePay) || 0)
  const grossSalary = numBase + numBonus + numSubsidy + numAllowance + numOvertime

  // Leave Mechanics: Unpaid days & Daily Wage Rate
  const numEarnedLeaves = Math.max(0, Number(earnedLeaves) || 0)
  const numLeaveDays = Math.max(0, Number(leaveDays) || 0)
  const unpaidDays = Math.max(0, numLeaveDays - numEarnedLeaves)
  const dailyWage = numBase > 0 ? numBase / ANNUAL_WORKING_DAYS : 0
  const computedLeaveDeduction = Math.round(unpaidDays * dailyWage)

  // Synchronize leave deduction whenever auto-calculate is active
  useEffect(() => {
    if (autoCalculateLeave) {
      setLeaveDeduction(String(computedLeaveDeduction))
    }
  }, [autoCalculateLeave, computedLeaveDeduction])

  const numInsurance = Math.max(0, Number(insurance) || 0)
  const numLeave = Math.max(0, Number(leaveDeduction) || 0)
  const totalDeductions = numInsurance + numLeave

  const netSalary = Math.max(0, grossSalary - totalDeductions)
  const currency = employee?.currency || 'USD'
  const fxRate = FX_RATES_TO_USD[currency] || 1.0
  const netSalaryUSD = Math.round(netSalary * fxRate)

  if (!employee) return null

  const deptStyle = getDepartmentStyle(employee.department)

  // Reset to original employee values
  const handleResetOriginal = () => {
    const base = employee.baseSalary || employee.salary || 0
    const eLeaves = employee.earnedLeaves !== undefined ? employee.earnedLeaves : 18
    const lDays = employee.leaveDays !== undefined ? employee.leaveDays : 0

    setBaseSalary(String(base))
    setBonus(String(employee.bonus !== undefined ? employee.bonus : Math.round(base * 0.08)))
    setSubsidy(String(employee.subsidy !== undefined ? employee.subsidy : Math.round(base * 0.03)))
    setAllowance(String(employee.allowance !== undefined ? employee.allowance : Math.round(base * 0.04)))
    setOvertimePay(String(employee.overtimePay !== undefined ? employee.overtimePay : 0))

    setEarnedLeaves(String(eLeaves))
    setLeaveDays(String(lDays))
    setAutoCalculateLeave(true)

    setInsurance(String(employee.insurance !== undefined ? employee.insurance : Math.round(base * 0.065)))
    setLeaveDeduction(String(employee.leaveDeduction !== undefined ? employee.leaveDeduction : 0))
    setError(null)
  }

  // Quick preset calculation helpers
  const applyBonusPercent = (pct: number) => {
    setBonus(String(Math.round(numBase * (pct / 100))))
  }

  const applySubsidyPercent = (pct: number) => {
    setSubsidy(String(Math.round(numBase * (pct / 100))))
  }

  const applyAllowancePercent = (pct: number) => {
    setAllowance(String(Math.round(numBase * (pct / 100))))
  }

  const applyInsurancePercent = (pct: number) => {
    setInsurance(String(Math.round(numBase * (pct / 100))))
  }

  // Handle Save
  const handleSave = async () => {
    if (numBase <= 0) {
      setError('Basic Salary must be greater than 0')
      return
    }

    if (!onSave) {
      onClose()
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      await onSave(employee.id, {
        baseSalary: numBase,
        bonus: numBonus,
        subsidy: numSubsidy,
        allowance: numAllowance,
        overtimePay: numOvertime,
        earnedLeaves: numEarnedLeaves,
        leaveDays: numLeaveDays,
        insurance: numInsurance,
        leaveDeduction: numLeave
      })
      setIsSaving(false)
      onClose()
    } catch (err: any) {
      setIsSaving(false)
      setError(err?.message || 'Failed to update compensation package')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '14px',
            overflow: 'hidden',
            border: '1px solid #eef1f6',
            boxShadow: '0 25px 45px -12px rgba(15, 23, 42, 0.16)'
          }
        }
      }}
    >
      {/* 1. Integrated Hero Profile Header */}
      <DialogTitle
        sx={{
          py: 1.5,
          px: 2.25,
          borderBottom: '1px solid #eef1f6',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.25
        }}
      >
        {/* Left: Employee Identity Block */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Stylized Rounded-Square Avatar */}
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              fontSize: '0.95rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #bfdbfe',
              flexShrink: 0
            }}
          >
            {employee.name.slice(0, 2).toUpperCase()}
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e242e', lineHeight: 1.15, fontSize: '1.05rem' }}>
                {employee.name}
              </Typography>
              <Box
                component="span"
                sx={{
                  px: 0.85,
                  py: 0.15,
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: deptStyle.bg,
                  color: deptStyle.color,
                  border: `1px solid ${deptStyle.border}`
                }}
              >
                {employee.department}
              </Box>
            </Box>

            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
              {employee.jobTitle} • {employee.email}
            </Typography>
          </Box>
        </Box>

        {/* Right: Badges & Close Button */}
        <Box sx={{ display: 'flex', gap: 0.85, alignItems: 'center' }}>
          <Chip
            label={employee.country}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '0.72rem',
              height: 24,
              borderRadius: '6px',
              backgroundColor: '#f1f5f9',
              color: '#334155'
            }}
          />
          <Chip
            label={`Currency: ${currency}`}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 24,
              borderRadius: '6px',
              borderColor: '#2563eb',
              color: '#2563eb'
            }}
          />
          <IconButton size="small" onClick={onClose} sx={{ color: '#94a3b8', borderRadius: '8px', p: 0.5 }}>
            <Icon icon={AppIcon.CLOSE} width="20" height="20" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* 2. Main Workstation Body */}
      <DialogContent sx={{ p: 2, backgroundColor: '#f8f9fb' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1.5, py: 0.3, px: 1.5, fontSize: '0.8125rem', borderRadius: '8px' }}>
            {error}
          </Alert>
        )}

        {/* Attendance & Leave Mechanics Ledger Console */}
        <Box
          sx={{
            p: 1.25,
            mb: 1.75,
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #eef1f6',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
          }}
        >
          {/* Console Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.15 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '6px',
                  backgroundColor: '#fff0ee',
                  color: '#ff5442',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon icon={AppIcon.CALENDAR} width="15" height="15" />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#1e242e', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.72rem' }}>
                Attendance & Leave Tracker (Annual Basis — 260 Working Days)
              </Typography>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={autoCalculateLeave}
                  onChange={(e) => setAutoCalculateLeave(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="caption" sx={{ fontWeight: 700, color: autoCalculateLeave ? '#2563eb' : '#64748b', fontSize: '0.72rem' }}>
                  {autoCalculateLeave ? 'Auto-Sync Active' : 'Manual Override'}
                </Typography>
              }
              sx={{ m: 0 }}
            />
          </Box>

          {/* 4 Symmetrical Console Micro-Cards */}
          <Grid container spacing={1.15} sx={{ alignItems: 'center' }}>
            {/* 1. Paid Leave Quota */}
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: '8px',
                  border: '1px solid #eef1f6',
                  backgroundColor: '#f8fafc'
                }}
              >
                <Typography variant="caption" sx={{ display: 'block', color: '#64748b', fontSize: '0.68rem', fontWeight: 600, mb: 0.35 }}>
                  Earned Paid Quota
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  fullWidth
                  value={earnedLeaves}
                  onChange={(e) => setEarnedLeaves(e.target.value)}
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end" sx={{ '& p': { fontSize: '0.7rem' } }}>d/yr</InputAdornment>,
                      sx: { fontSize: '0.8125rem', height: 32, borderRadius: '6px', backgroundColor: '#ffffff', fontWeight: 700 }
                    }
                  }}
                />
              </Box>
            </Grid>

            {/* 2. Leaves Taken */}
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: '8px',
                  border: '1px solid #eef1f6',
                  backgroundColor: '#f8fafc'
                }}
              >
                <Typography variant="caption" sx={{ display: 'block', color: '#64748b', fontSize: '0.68rem', fontWeight: 600, mb: 0.35 }}>
                  Total Leaves Taken
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  fullWidth
                  value={leaveDays}
                  onChange={(e) => setLeaveDays(e.target.value)}
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end" sx={{ '& p': { fontSize: '0.7rem' } }}>days</InputAdornment>,
                      sx: { fontSize: '0.8125rem', height: 32, borderRadius: '6px', backgroundColor: '#ffffff', fontWeight: 700 }
                    }
                  }}
                />
              </Box>
            </Grid>

            {/* 3. Unpaid Balance Status */}
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box
                sx={{
                  p: 1,
                  height: 61,
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: unpaidDays > 0 ? '#ffcdd2' : '#c8e6c9',
                  backgroundColor: unpaidDays > 0 ? '#fff5f5' : '#f0fdf4',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                    Unpaid Balance
                  </Typography>
                  <Icon
                    icon={unpaidDays > 0 ? AppIcon.DANGER : AppIcon.CHECK}
                    width="15"
                    height="15"
                    color={unpaidDays > 0 ? '#ef4444' : '#10b981'}
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: unpaidDays > 0 ? '#ef4444' : '#10b981',
                    fontSize: '0.825rem',
                    lineHeight: 1.2,
                    mt: 0.25
                  }}
                >
                  {unpaidDays > 0 ? `${unpaidDays} Days Unpaid` : '0 Days (Fully Covered)'}
                </Typography>
              </Box>
            </Grid>

            {/* 4. Daily Wage Rate */}
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box
                sx={{
                  p: 1,
                  height: 61,
                  borderRadius: '8px',
                  border: '1px solid #eef1f6',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                    Daily Wage Rate
                  </Typography>
                  <Tooltip title="Daily Wage = Base Salary ÷ 260 working days per year">
                    <Icon icon={AppIcon.INFO} width="14" height="14" color="#94a3b8" />
                  </Tooltip>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#1e242e', fontSize: '0.825rem', lineHeight: 1.2, mt: 0.25 }}>
                  {formatCurrency(dailyWage, currency)}/day
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Symmetrical 2-Column Ledger Workstation */}
        <Grid container spacing={1.5}>
          {/* Column 1: Welfare Additions (+) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                border: '1px solid #eef1f6',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
              }}
            >
              <Box>
                {/* Column Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '6px',
                        backgroundColor: '#e8f8f0',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon icon={AppIcon.PAYROLL_BOLD} width="14" height="14" />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#10b981', fontSize: '0.84rem' }}>
                      Earnings & Welfare Additions (+)
                    </Typography>
                  </Box>
                  <Chip
                    label="5 Items"
                    size="small"
                    sx={{ height: 18, fontSize: '0.67rem', backgroundColor: '#e8f8f0', color: '#10b981', fontWeight: 700, borderRadius: '6px' }}
                  />
                </Box>

                {/* Ledger Item Rows */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
                  {/* Row 1: Basic Base Salary */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e242e', fontSize: '0.8rem' }}>
                        Basic Base Salary
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>
                        Contractual baseline wage
                      </Typography>
                    </Box>
                    <TextField
                      size="small"
                      type="number"
                      value={baseSalary}
                      onChange={(e) => setBaseSalary(e.target.value)}
                      sx={{ width: 155 }}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: '0.72rem' } }}>{currency}</InputAdornment>,
                          sx: { fontSize: '0.8125rem', height: 34, borderRadius: '6px', backgroundColor: '#f8fafc', fontWeight: 600 }
                        }
                      }}
                    />
                  </Box>

                  {/* Row 2: Performance Bonus */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e242e', fontSize: '0.8rem' }}>
                          Performance Bonus
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => applyBonusPercent(8)}
                          sx={{ minWidth: 32, height: 18, p: 0, fontSize: '0.64rem', fontWeight: 700, color: '#10b981', backgroundColor: '#e8f8f0', borderRadius: '4px' }}
                        >
                          8%
                        </Button>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>
                        Target KPI attainment
                      </Typography>
                    </Box>
                    <TextField
                      size="small"
                      type="number"
                      value={bonus}
                      onChange={(e) => setBonus(e.target.value)}
                      sx={{ width: 155 }}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: '0.72rem' } }}>+{currency}</InputAdornment>,
                          sx: { fontSize: '0.8125rem', height: 34, borderRadius: '6px', backgroundColor: '#f8fafc', fontWeight: 600 }
                        }
                      }}
                    />
                  </Box>

                  {/* Row 3: Commute / Meal Subsidy */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e242e', fontSize: '0.8rem' }}>
                          Meal / Commute Subsidy
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => applySubsidyPercent(3)}
                          sx={{ minWidth: 32, height: 18, p: 0, fontSize: '0.64rem', fontWeight: 700, color: '#10b981', backgroundColor: '#e8f8f0', borderRadius: '4px' }}
                        >
                          3%
                        </Button>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>
                        Daily lunch & transit support
                      </Typography>
                    </Box>
                    <TextField
                      size="small"
                      type="number"
                      value={subsidy}
                      onChange={(e) => setSubsidy(e.target.value)}
                      sx={{ width: 155 }}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: '0.72rem' } }}>+{currency}</InputAdornment>,
                          sx: { fontSize: '0.8125rem', height: 34, borderRadius: '6px', backgroundColor: '#f8fafc', fontWeight: 600 }
                        }
                      }}
                    />
                  </Box>

                  {/* Row 4: Role & Housing Allowance */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e242e', fontSize: '0.8rem' }}>
                          Role & Housing Allowance
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => applyAllowancePercent(4)}
                          sx={{ minWidth: 32, height: 18, p: 0, fontSize: '0.64rem', fontWeight: 700, color: '#10b981', backgroundColor: '#e8f8f0', borderRadius: '4px' }}
                        >
                          4%
                        </Button>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>
                        Position & remote stipend
                      </Typography>
                    </Box>
                    <TextField
                      size="small"
                      type="number"
                      value={allowance}
                      onChange={(e) => setAllowance(e.target.value)}
                      sx={{ width: 155 }}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: '0.72rem' } }}>+{currency}</InputAdornment>,
                          sx: { fontSize: '0.8125rem', height: 34, borderRadius: '6px', backgroundColor: '#f8fafc', fontWeight: 600 }
                        }
                      }}
                    />
                  </Box>

                  {/* Row 5: Overtime Compensation */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e242e', fontSize: '0.8rem' }}>
                        Overtime Compensation
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>
                        Extra verified shift hours
                      </Typography>
                    </Box>
                    <TextField
                      size="small"
                      type="number"
                      value={overtimePay}
                      onChange={(e) => setOvertimePay(e.target.value)}
                      sx={{ width: 155 }}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: '0.72rem' } }}>+{currency}</InputAdornment>,
                          sx: { fontSize: '0.8125rem', height: 34, borderRadius: '6px', backgroundColor: '#f8fafc', fontWeight: 600 }
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Gross Earnings Subtotal Banner */}
              <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px solid #eef1f6' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>
                    Gross Earnings Subtotal:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#10b981', fontSize: '0.95rem' }}>
                    {formatCurrency(grossSalary, currency)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Column 2: Deductions of Wages (−) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                border: '1px solid #eef1f6',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
              }}
            >
              <Box>
                {/* Column Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '6px',
                        backgroundColor: '#fff0ee',
                        color: '#ff5442',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon icon={AppIcon.SHIELD} width="14" height="14" />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ff5442', fontSize: '0.84rem' }}>
                      Statutory & Wage Deductions (−)
                    </Typography>
                  </Box>
                  <Chip
                    label="Customizable"
                    size="small"
                    sx={{ height: 18, fontSize: '0.67rem', backgroundColor: '#fff0ee', color: '#ff5442', fontWeight: 700, borderRadius: '6px' }}
                  />
                </Box>

                {/* Ledger Item Rows */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
                  {/* Row 1: Social & Health Insurance */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e242e', fontSize: '0.8rem' }}>
                          Social & Health Insurance
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => applyInsurancePercent(6.5)}
                          sx={{ minWidth: 36, height: 18, p: 0, fontSize: '0.64rem', fontWeight: 700, color: '#ff5442', backgroundColor: '#fff0ee', borderRadius: '4px' }}
                        >
                          6.5%
                        </Button>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>
                        Statutory pension & healthcare
                      </Typography>
                    </Box>
                    <TextField
                      size="small"
                      type="number"
                      value={insurance}
                      onChange={(e) => setInsurance(e.target.value)}
                      sx={{ width: 155 }}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: '0.72rem' } }}>−{currency}</InputAdornment>,
                          sx: { fontSize: '0.8125rem', height: 34, borderRadius: '6px', backgroundColor: '#f8fafc', fontWeight: 600 }
                        }
                      }}
                    />
                  </Box>

                  {/* Row 2: Unpaid Leave Deductions */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e242e', fontSize: '0.8rem' }}>
                          Unpaid Leave Deductions
                        </Typography>
                        <Tooltip
                          title={
                            autoCalculateLeave
                              ? 'Automatically calculated: Unpaid Days × Daily Wage'
                              : 'Manual custom value. Click Auto-Sync switch above to re-bind.'
                          }
                        >
                          <Chip
                            label={autoCalculateLeave ? 'Auto' : 'Manual'}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                              backgroundColor: autoCalculateLeave ? '#eff6ff' : '#fef3c7',
                              color: autoCalculateLeave ? '#2563eb' : '#d97706'
                            }}
                          />
                        </Tooltip>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>
                        {unpaidDays > 0 ? `${unpaidDays} excess days @ ${formatCurrency(dailyWage, currency)}/d` : 'Zero leave deduction'}
                      </Typography>
                    </Box>
                    <TextField
                      size="small"
                      type="number"
                      value={leaveDeduction}
                      onChange={(e) => {
                        setAutoCalculateLeave(false)
                        setLeaveDeduction(e.target.value)
                      }}
                      sx={{ width: 155 }}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: '0.72rem' } }}>−{currency}</InputAdornment>,
                          sx: { fontSize: '0.8125rem', height: 34, borderRadius: '6px', backgroundColor: '#f8fafc', fontWeight: 600 }
                        }
                      }}
                    />
                  </Box>

                  {/* Statutory Policy & Compliance Information Card */}
                  <Box
                    sx={{
                      p: 1.15,
                      mt: 0.5,
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px dashed #cbd5e1'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.4 }}>
                      <Icon icon={AppIcon.INFO} width="14" height="14" color="#64748b" />
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', fontSize: '0.71rem' }}>
                        {employee.country} Statutory Payroll Rules:
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.69rem', display: 'block', lineHeight: 1.35 }}>
                      • Standard Paid Quota: 18 days/yr. Unpaid days deduct at base rate (1/260).
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.69rem', display: 'block', lineHeight: 1.35 }}>
                      • Statutory insurance withholdings conform to local labour law.
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Total Deductions Subtotal Banner */}
              <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px solid #eef1f6' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>
                    Total Deductions Subtotal:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ef4444', fontSize: '0.95rem' }}>
                    −{formatCurrency(totalDeductions, currency)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* 3. Live Net Take-Home Salary Banner */}
        <Box
          sx={{
            mt: 1.75,
            p: 1.5,
            borderRadius: '10px',
            backgroundColor: '#1e242e',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 800, fontSize: '0.68rem' }}>
              Live Net Take-Home Compensation (Gross Subtotal − Deductions)
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#38bdf8', mt: 0.15, lineHeight: 1.1, fontSize: '1.45rem' }}>
              {formatCurrency(netSalary, currency)}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
              Gross ({formatCurrency(grossSalary, currency)}) − Total Deductions ({formatCurrency(totalDeductions, currency)})
            </Typography>
          </Box>

          {currency !== 'USD' && (
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem', display: 'block', fontWeight: 600 }}>
                Normalized Baseline (USD)
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f1f5f9', fontSize: '1.05rem' }}>
                ≈ {formatCurrency(netSalaryUSD, 'USD')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem' }}>
                Fixed FX Rate: 1 {currency} = {fxRate} USD
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* 4. Symmetrical Actions Bar */}
      <DialogActions sx={{ px: 2.25, py: 1.25, borderTop: '1px solid #eef1f6', backgroundColor: '#ffffff', justifyContent: 'space-between' }}>
        <Button
          onClick={handleResetOriginal}
          color="inherit"
          size="small"
          disabled={isSaving}
          startIcon={<Icon icon={AppIcon.RESET} width="14" height="14" />}
          sx={{ fontSize: '0.8125rem', borderRadius: '8px', color: '#64748b' }}
        >
          Reset to Baseline
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} color="inherit" size="small" disabled={isSaving} sx={{ fontSize: '0.8125rem', borderRadius: '8px' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            size="small"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : <Icon icon={AppIcon.SAVE} width="15" height="15" />}
            sx={{
              fontWeight: 700,
              fontSize: '0.8125rem',
              px: 2.5,
              borderRadius: '8px',
              backgroundColor: '#ff5442',
              '&:hover': { backgroundColor: '#e03a29' }
            }}
          >
            {isSaving ? 'Saving...' : 'Save Adjustments'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}
