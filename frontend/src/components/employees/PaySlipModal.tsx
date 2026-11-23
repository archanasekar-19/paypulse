import type React from 'react'
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
  Chip
} from '@mui/material'
import { Icon } from '@iconify/react'
import type { Employee } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import { getDepartmentStyle } from '../../constants/departments'

interface PaySlipModalProps {
  open: boolean
  employee: Employee | null
  onClose: () => void
}

export const PaySlipModal: React.FC<PaySlipModalProps> = ({ open, employee, onClose }) => {
  if (!employee) return null

  const currency = employee.currency
  const baseSalary = employee.baseSalary || employee.salary || 0
  const bonus = employee.bonus || Math.round(baseSalary * 0.08)
  const subsidy = employee.subsidy || Math.round(baseSalary * 0.03)
  const allowance = employee.allowance || Math.round(baseSalary * 0.04)
  const overtimePay = employee.overtimePay || 0
  const grossSalary = employee.grossSalary || (baseSalary + bonus + subsidy + allowance + overtimePay)

  const insurance = employee.insurance || Math.round(baseSalary * 0.065)
  const leaveDeduction = employee.leaveDeduction || 0
  const totalDeductions = insurance + leaveDeduction

  const netSalary = employee.netSalary || (grossSalary - totalDeductions)
  const deptStyle = getDepartmentStyle(employee.department)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Slip Title */}
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
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
              Compensation Slip & Welfare Breakdown
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ACME Corporation • Automated Payroll & Welfare Engine
            </Typography>
          </Box>
        </Box>

        <Chip
          label={employee.country}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600, color: 'text.secondary' }}
        />
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        {/* Employee Summary Card */}
        <Box
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: '#f8fafc',
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
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
                px: 1.2,
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
              label={`Currency: ${currency}`}
              size="small"
              sx={{ fontWeight: 600, backgroundColor: '#f1f5f9', color: '#334155' }}
            />
          </Box>
        </Box>

        {/* 2-Column Itemized Breakdown (Earnings / Welfare vs Deductions) */}
        <Grid container spacing={3}>
          {/* Left Column: Earnings & Welfare Salary */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: 2.5,
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Icon icon="solar:wallet-money-bold" width="20" height="20" color="#16a34a" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#16a34a' }}>
                    Welfare Salary & Earnings (Additions)
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Basic Salary:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(baseSalary, currency)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Performance Bonus:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      +{formatCurrency(bonus, currency)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Commute / Meal Subsidy:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      +{formatCurrency(subsidy, currency)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Role / Housing Allowance:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      +{formatCurrency(allowance, currency)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Overtime Wages:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      +{formatCurrency(overtimePay, currency)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mt: 2.5 }}>
                <Divider sx={{ mb: 1.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Gross Earnings Subtotal:
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#16a34a' }}>
                    {formatCurrency(grossSalary, currency)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right Column: Deduction of Wages */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: 2.5,
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Icon icon="solar:shield-warning-bold" width="20" height="20" color="#dc2626" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#dc2626' }}>
                    Deduction of Wages (Subtractions)
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Social & Health Insurance:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#dc2626' }}>
                      -{formatCurrency(insurance, currency)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Absence / Leave Deductions:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#dc2626' }}>
                      -{formatCurrency(leaveDeduction, currency)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', opacity: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Other Statutory Levies:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      -{formatCurrency(0, currency)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mt: 2.5 }}>
                <Divider sx={{ mb: 1.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Total Deductions Subtotal:
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#dc2626' }}>
                    -{formatCurrency(totalDeductions, currency)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Callout: Net Take-Home Salary */}
        <Box
          sx={{
            mt: 3,
            p: 2.5,
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
            <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Net Take-Home Pay (Gross Subtotal − Total Deductions)
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#38bdf8', mt: 0.3 }}>
              {formatCurrency(netSalary, currency)}
            </Typography>
          </Box>

          {currency !== 'USD' && employee.netSalaryUSD && (
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Normalized Baseline
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
                ≈ {formatCurrency(employee.netSalaryUSD, 'USD')}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Close Pay Slip
        </Button>
      </DialogActions>
    </Dialog>
  )
}
