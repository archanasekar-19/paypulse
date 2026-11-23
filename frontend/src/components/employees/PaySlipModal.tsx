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
            borderRadius: '16px', // iLovePDF smooth rounded corner
            overflow: 'hidden',
            border: '1px solid #eef1f6',
            boxShadow: '0 20px 30px -10px rgba(15, 23, 42, 0.12)'
          }
        }
      }}
    >
      {/* Symmetrical Eye-Comfortable Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.25,
          px: 2.25,
          borderBottom: '1px solid #eef1f6',
          backgroundColor: '#ffffff'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          {/* iLovePDF rounded-square coral icon badge */}
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              backgroundColor: '#fff0ee',
              color: '#ff5442',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Icon icon={AppIcon.PAYSLIP} width="22" height="22" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#1e242e', fontSize: '1rem' }}>
              Payroll & Welfare Compensation Slip
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.73rem', display: 'block' }}>
              Configurable welfare additions, statutory withholdings & leave deductions
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
            label={currency}
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
          <IconButton size="small" onClick={onClose} sx={{ color: '#94a3b8', ml: 0.5 }}>
            <Icon icon={AppIcon.CLOSE} width="20" height="20" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2, backgroundColor: '#f8f9fb' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1.5, py: 0.25, px: 1.5, fontSize: '0.8125rem', borderRadius: '10px' }}>
            {error}
          </Alert>
        )}

        {/* Dense Employee Profile Bar */}
        <Box
          sx={{
            py: 0.85,
            px: 1.5,
            mb: 1.5,
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #eef1f6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                color: '#1e242e',
                fontWeight: 700,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e2e8f0'
              }}
            >
              {employee.name.slice(0, 2).toUpperCase()}
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e242e', lineHeight: 1.2 }}>
                {employee.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.73rem' }}>
                {employee.jobTitle} • {employee.email}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="span"
              sx={{
                px: 1,
                py: 0.2,
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 600,
                backgroundColor: deptStyle.bg,
                color: deptStyle.color,
                border: `1px solid ${deptStyle.border}`
              }}
            >
              {employee.department}
            </Box>
          </Box>
        </Box>

        {/* Compact Attendance & Leave Mechanics Panel (iLovePDF Symmetrical Mini-Card Row) */}
        <Box
          sx={{
            p: 1.25,
            mb: 1.5,
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #eef1f6'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Icon icon={AppIcon.CALENDAR} width="16" height="16" color="#ff5442" />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e242e', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.72rem' }}>
                Attendance & Leave Mechanics (260 Annual Working Days)
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
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.72rem' }}>
                  Auto-Sync Deduction
                </Typography>
              }
              sx={{ m: 0 }}
            />
          </Box>

          <Grid container spacing={1.25} sx={{ alignItems: 'center' }}>
            {/* Earned Leaves Quota */}
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Earned Leaves Quota"
                size="small"
                type="number"
                fullWidth
                value={earnedLeaves}
                onChange={(e) => setEarnedLeaves(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end" sx={{ '& p': { fontSize: '0.7rem' } }}>d/yr</InputAdornment>,
                    sx: { fontSize: '0.8125rem', height: 36, borderRadius: '8px', backgroundColor: '#f8fafc' }
                  },
                  inputLabel: { sx: { fontSize: '0.78rem' } }
                }}
              />
            </Grid>

            {/* Total Leaves Taken */}
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Total Leaves Taken"
                size="small"
                type="number"
                fullWidth
                value={leaveDays}
                onChange={(e) => setLeaveDays(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end" sx={{ '& p': { fontSize: '0.7rem' } }}>days</InputAdornment>,
                    sx: { fontSize: '0.8125rem', height: 36, borderRadius: '8px', backgroundColor: '#f8fafc' }
                  },
                  inputLabel: { sx: { fontSize: '0.78rem' } }
                }}
              />
            </Grid>

            {/* Unpaid Days Status */}
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box
                sx={{
                  px: 1.25,
                  py: 0.6,
                  height: 36,
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: unpaidDays > 0 ? '#ffcdd2' : '#c8e6c9',
                  backgroundColor: unpaidDays > 0 ? '#fff5f5' : '#f0fdf4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ display: 'block', fontSize: '0.67rem', color: '#64748b', lineHeight: 1 }}>
                    Unpaid Days
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: unpaidDays > 0 ? '#ef4444' : '#10b981',
                      fontSize: '0.78rem'
                    }}
                  >
                    {unpaidDays > 0 ? `${unpaidDays} days` : '0 days (Covered)'}
                  </Typography>
                </Box>
                <Icon
                  icon={unpaidDays > 0 ? AppIcon.DANGER : AppIcon.CHECK}
                  width="17"
                  height="17"
                  color={unpaidDays > 0 ? '#ef4444' : '#10b981'}
                />
              </Box>
            </Grid>

            {/* Daily Wage Rate */}
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box
                sx={{
                  px: 1.25,
                  py: 0.6,
                  height: 36,
                  borderRadius: '8px',
                  border: '1px solid #eef1f6',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ display: 'block', fontSize: '0.67rem', color: '#64748b', lineHeight: 1 }}>
                    Daily Wage Rate
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e242e', fontSize: '0.78rem' }}>
                    {formatCurrency(dailyWage, currency)}/d
                  </Typography>
                </Box>
                <Tooltip title="Daily Wage = Base Salary ÷ 260 working days">
                  <Icon icon={AppIcon.INFO} width="15" height="15" color="#94a3b8" />
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Symmetrical 2-Column Workstation: Left (Welfare Additions) | Right (Wage Deductions) */}
        <Grid container spacing={1.5}>
          {/* Column 1: Welfare Salary & Additions (+) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                border: '1px solid #eef1f6',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'space-between'
              }}
            >
              <Box>
                {/* Column Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: '6px',
                        backgroundColor: '#e8f8f0',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon icon={AppIcon.PAYROLL_BOLD} width="15" height="15" />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#10b981', fontSize: '0.825rem' }}>
                      Earnings & Welfare Additions (+)
                    </Typography>
                  </Box>
                  <Chip
                    label="5 Items"
                    size="small"
                    sx={{ height: 18, fontSize: '0.67rem', backgroundColor: '#e8f8f0', color: '#10b981', fontWeight: 600, borderRadius: '6px' }}
                  />
                </Box>

                {/* Symmetrical Compact Input Stack */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85 }}>
                  <TextField
                    label="Basic Base Salary"
                    size="small"
                    type="number"
                    fullWidth
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: '0.75rem' } }}>{currency}</InputAdornment>,
                        sx: { fontSize: '0.8125rem', height: 35, borderRadius: '8px', backgroundColor: '#f8fafc' }
                      },
                      inputLabel: { sx: { fontSize: '0.78rem' } }
                    }}
                  />

                  <TextField
                    label="Performance Bonus"
                    size="small"
                    type="number"
                    fullWidth
                    value={bonus}
                    onChange={(e) => setBonus(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: '0.75rem' } }}>+{currency}</InputAdornment>,
                        sx: { fontSize: '0.8125rem', height: 35, borderRadius: '8px', backgroundColor: '#f8fafc' }
                      },
                      inputLabel: { sx: { fontSize: '0.78rem' } }
                    }}
                  />

                  <TextField
                    label="Commute / Meal Subsidy"
                    size="small"
                    type="number"
                    fullWidth
                    value={subsidy}
                    onChange={(e) => setSubsidy(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: '0.75rem' } }}>+{currency}</InputAdornment>,
                        sx: { fontSize: '0.8125rem', height: 35, borderRadius: '8px', backgroundColor: '#f8fafc' }
                      },
                      inputLabel: { sx: { fontSize: '0.78rem' } }
                    }}
                  />

                  <TextField
                    label="Role & Housing Allowance"
                    size="small"
                    type="number"
                    fullWidth
                    value={allowance}
                    onChange={(e) => setAllowance(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: '0.75rem' } }}>+{currency}</InputAdornment>,
                        sx: { fontSize: '0.8125rem', height: 35, borderRadius: '8px', backgroundColor: '#f8fafc' }
                      },
                      inputLabel: { sx: { fontSize: '0.78rem' } }
                    }}
                  />

                  <TextField
                    label="Overtime Wages"
                    size="small"
                    type="number"
                    fullWidth
                    value={overtimePay}
                    onChange={(e) => setOvertimePay(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: '0.75rem' } }}>+{currency}</InputAdornment>,
                        sx: { fontSize: '0.8125rem', height: 35, borderRadius: '8px', backgroundColor: '#f8fafc' }
                      },
                      inputLabel: { sx: { fontSize: '0.78rem' } }
                    }}
                  />
                </Box>
              </Box>

              {/* Gross Earnings Subtotal */}
              <Box sx={{ mt: 1.25, pt: 1, borderTop: '1px solid #eef1f6' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>
                    Gross Earnings Subtotal:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#10b981', fontSize: '0.925rem' }}>
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
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                border: '1px solid #eef1f6',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'space-between'
              }}
            >
              <Box>
                {/* Column Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: '6px',
                        backgroundColor: '#fff0ee',
                        color: '#ff5442',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon icon={AppIcon.SHIELD} width="15" height="15" />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ff5442', fontSize: '0.825rem' }}>
                      Statutory & Wage Deductions (−)
                    </Typography>
                  </Box>
                  <Chip
                    label="Customizable"
                    size="small"
                    sx={{ height: 18, fontSize: '0.67rem', backgroundColor: '#fff0ee', color: '#ff5442', fontWeight: 600, borderRadius: '6px' }}
                  />
                </Box>

                {/* Symmetrical Compact Input Stack */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85 }}>
                  <TextField
                    label="Social & Health Insurance"
                    size="small"
                    type="number"
                    fullWidth
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: '0.75rem' } }}>−{currency}</InputAdornment>,
                        sx: { fontSize: '0.8125rem', height: 35, borderRadius: '8px', backgroundColor: '#f8fafc' }
                      },
                      inputLabel: { sx: { fontSize: '0.78rem' } }
                    }}
                  />

                  <TextField
                    label={autoCalculateLeave ? 'Leave Deduction (Auto-Calculated)' : 'Leave Deduction (Custom Override)'}
                    size="small"
                    type="number"
                    fullWidth
                    value={leaveDeduction}
                    onChange={(e) => {
                      setAutoCalculateLeave(false)
                      setLeaveDeduction(e.target.value)
                    }}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: '0.75rem' } }}>−{currency}</InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip
                              title={
                                autoCalculateLeave
                                  ? 'Synced to Unpaid Days × Daily Wage. Edit value to override manually.'
                                  : 'Custom manual value. Click Auto-Sync to re-bind.'
                              }
                            >
                              <Chip
                                label={autoCalculateLeave ? 'Auto' : 'Manual'}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.65rem',
                                  fontWeight: 600,
                                  borderRadius: '6px',
                                  backgroundColor: autoCalculateLeave ? '#eff6ff' : '#fef3c7',
                                  color: autoCalculateLeave ? '#2563eb' : '#d97706'
                                }}
                              />
                            </Tooltip>
                          </InputAdornment>
                        ),
                        sx: { fontSize: '0.8125rem', height: 35, borderRadius: '8px', backgroundColor: '#f8fafc' }
                      },
                      inputLabel: { sx: { fontSize: '0.78rem' } }
                    }}
                  />

                  {/* Symmetrical Policy & Labor Compliance Box */}
                  <Box
                    sx={{
                      p: 1.15,
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px dashed #cbd5e1'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.4 }}>
                      <Icon icon={AppIcon.INFO} width="13" height="13" color="#64748b" />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.71rem' }}>
                        {employee.country} Statutory Payroll Rules:
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.69rem', display: 'block', lineHeight: 1.3 }}>
                      • Standard Paid Quota: 18 days/yr. Unpaid days deduct at base rate (1/260).
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.69rem', display: 'block', lineHeight: 1.3 }}>
                      • Statutory insurance withholdings conform to local labour law.
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Total Deductions Subtotal */}
              <Box sx={{ mt: 1.25, pt: 1, borderTop: '1px solid #eef1f6' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>
                    Total Deductions Subtotal:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ef4444', fontSize: '0.925rem' }}>
                    −{formatCurrency(totalDeductions, currency)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Live Net Take-Home Salary Banner */}
        <Box
          sx={{
            mt: 1.5,
            p: 1.5,
            borderRadius: '12px',
            backgroundColor: '#1e242e', // iLovePDF smooth deep charcoal
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.5
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, fontSize: '0.68rem' }}>
              Live Net Take-Home Compensation (Gross Subtotal − Deductions)
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#38bdf8', mt: 0.2, lineHeight: 1.1, fontSize: '1.35rem' }}>
              {formatCurrency(netSalary, currency)}
            </Typography>
          </Box>

          {currency !== 'USD' && (
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem', display: 'block' }}>
                Normalized Baseline (USD)
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
                ≈ {formatCurrency(netSalaryUSD, 'USD')}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* Symmetrical Actions Bar (Clean Rounded Square Buttons) */}
      <DialogActions sx={{ px: 2.25, py: 1.25, borderTop: '1px solid #eef1f6', backgroundColor: '#ffffff', justifyContent: 'space-between' }}>
        <Button onClick={handleResetOriginal} color="inherit" size="small" disabled={isSaving} sx={{ fontSize: '0.8125rem', borderRadius: '8px' }}>
          Reset Values
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
