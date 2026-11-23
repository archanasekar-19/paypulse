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
  Divider,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material'
import { Icon } from '@iconify/react'
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

  // Editable Wage Deductions state
  const [insurance, setInsurance] = useState<string>('0')
  const [leaveDeduction, setLeaveDeduction] = useState<string>('0')

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate data when dialog opens
  useEffect(() => {
    if (open && employee) {
      const base = employee.baseSalary || employee.salary || 0
      setBaseSalary(String(base))
      setBonus(String(employee.bonus || Math.round(base * 0.08)))
      setSubsidy(String(employee.subsidy || Math.round(base * 0.03)))
      setAllowance(String(employee.allowance || Math.round(base * 0.04)))
      setOvertimePay(String(employee.overtimePay || 0))
      setInsurance(String(employee.insurance || Math.round(base * 0.065)))
      setLeaveDeduction(String(employee.leaveDeduction || 0))
      setError(null)
    }
  }, [open, employee])

  if (!employee) return null

  const currency = employee.currency
  const fxRate = FX_RATES_TO_USD[currency] || 1.0
  const deptStyle = getDepartmentStyle(employee.department)

  // Live Calculated Numbers
  const numBase = Math.max(0, Number(baseSalary) || 0)
  const numBonus = Math.max(0, Number(bonus) || 0)
  const numSubsidy = Math.max(0, Number(subsidy) || 0)
  const numAllowance = Math.max(0, Number(allowance) || 0)
  const numOvertime = Math.max(0, Number(overtimePay) || 0)
  const grossSalary = numBase + numBonus + numSubsidy + numAllowance + numOvertime

  const numInsurance = Math.max(0, Number(insurance) || 0)
  const numLeave = Math.max(0, Number(leaveDeduction) || 0)
  const totalDeductions = numInsurance + numLeave

  const netSalary = Math.max(0, grossSalary - totalDeductions)
  const netSalaryUSD = Math.round(netSalary * fxRate)

  // Reset to original values
  const handleResetOriginal = () => {
    const base = employee.baseSalary || employee.salary || 0
    setBaseSalary(String(base))
    setBonus(String(employee.bonus || Math.round(base * 0.08)))
    setSubsidy(String(employee.subsidy || Math.round(base * 0.03)))
    setAllowance(String(employee.allowance || Math.round(base * 0.04)))
    setOvertimePay(String(employee.overtimePay || 0))
    setInsurance(String(employee.insurance || Math.round(base * 0.065)))
    setLeaveDeduction(String(employee.leaveDeduction || 0))
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Slip Title Header */}
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon icon="solar:bill-list-bold-duotone" width="24" height="24" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Compensation Slip & Welfare Structure
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Customizable salary additions, allowances, and statutory wage deductions
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            icon={<Icon icon="solar:pen-linear" width="14" height="14" />}
            label="Editable Breakdown"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.72rem' }}
          />
          <Chip
            label={employee.country}
            size="small"
            sx={{ fontWeight: 600, backgroundColor: '#f1f5f9', color: 'text.secondary' }}
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2.5 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Employee Summary Ribbon */}
        <Box
          sx={{
            p: 1.75,
            mb: 2.5,
            backgroundColor: '#f8fafc',
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.5
          }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {employee.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {employee.email} • {employee.jobTitle}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="span"
              sx={{
                px: 1,
                py: 0.3,
                borderRadius: 1,
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: deptStyle.bg,
                color: deptStyle.color,
                border: `1px solid ${deptStyle.border}`
              }}
            >
              {employee.department}
            </Box>
            <Chip
              label={`Contract Currency: ${currency}`}
              size="small"
              sx={{ fontWeight: 600, backgroundColor: '#ffffff', border: '1px solid #cbd5e1' }}
            />
          </Box>
        </Box>

        {/* Symmetrical 2-Column ERP Workstation: Left (Additions) | Right (Deductions) */}
        <Grid container spacing={2.5}>
          {/* Column 1: Welfare Salary & Additions */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <Box>
                {/* Column Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.75 }}>
                  <Icon icon="solar:wallet-money-bold" width="18" height="18" color="#16a34a" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#16a34a' }}>
                    Earnings & Welfare Additions (+)
                  </Typography>
                </Box>

                {/* Symmetrical Compact Input Stack */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  <TextField
                    label="Basic Base Salary"
                    size="small"
                    type="number"
                    fullWidth
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">{currency}</InputAdornment>
                      }
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
                        startAdornment: <InputAdornment position="start">+{currency}</InputAdornment>
                      }
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
                        startAdornment: <InputAdornment position="start">+{currency}</InputAdornment>
                      }
                    }}
                  />

                  <TextField
                    label="Role / Housing Allowance"
                    size="small"
                    type="number"
                    fullWidth
                    value={allowance}
                    onChange={(e) => setAllowance(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">+{currency}</InputAdornment>
                      }
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
                        startAdornment: <InputAdornment position="start">+{currency}</InputAdornment>
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Gross Earnings Subtotal */}
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 1.25 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Gross Earnings Subtotal:
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#16a34a' }}>
                    {formatCurrency(grossSalary, currency)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Column 2: Deductions of Wages */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <Box>
                {/* Column Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.75 }}>
                  <Icon icon="solar:shield-warning-bold" width="18" height="18" color="#dc2626" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#dc2626' }}>
                    Deductions of Wages (−)
                  </Typography>
                </Box>

                {/* Symmetrical Compact Input Stack */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  <TextField
                    label="Social & Health Insurance"
                    size="small"
                    type="number"
                    fullWidth
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">−{currency}</InputAdornment>
                      }
                    }}
                  />

                  <TextField
                    label="Absence / Unpaid Leave Deductions"
                    size="small"
                    type="number"
                    fullWidth
                    value={leaveDeduction}
                    onChange={(e) => setLeaveDeduction(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">−{currency}</InputAdornment>
                      }
                    }}
                  />

                  {/* Informational Policy Box keeping visual symmetry with left column */}
                  <Box
                    sx={{
                      p: 1.75,
                      borderRadius: 1.5,
                      backgroundColor: '#f8fafc',
                      border: '1px dashed #cbd5e1',
                      mt: 0.5
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                      <Icon icon="solar:info-circle-linear" width="14" height="14" style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      Statutory Compliance Notes:
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Insurance contributions and unpaid leave deductions are calculated based on {employee.country} labour regulations.
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Total Deductions Subtotal */}
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 1.25 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Total Deductions Subtotal:
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#dc2626' }}>
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
            mt: 2.5,
            p: 2,
            borderRadius: 2,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
              Live Net Take-Home Compensation (Gross Subtotal − Total Deductions)
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#38bdf8', mt: 0.2 }}>
              {formatCurrency(netSalary, currency)}
            </Typography>
          </Box>

          {currency !== 'USD' && (
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Normalized Baseline
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
                ≈ {formatCurrency(netSalaryUSD, 'USD')}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button onClick={handleResetOriginal} color="inherit" size="small" disabled={isSaving}>
          Reset Values
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} color="inherit" disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <Icon icon="solar:diskette-bold" width="18" height="18" />}
          >
            {isSaving ? 'Saving Adjustments...' : 'Save Adjustments'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}
