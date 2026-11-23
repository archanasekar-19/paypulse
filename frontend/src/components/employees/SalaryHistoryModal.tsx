import React, { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  InputAdornment
} from '@mui/material'
import { Icon } from '@iconify/react'
import { AppIcon } from '../../constants/icons'
import type { Employee, SalaryHistoryEntry, NewSalaryRevisionInput } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import { getDepartmentStyle } from '../../constants/departments'

interface SalaryHistoryModalProps {
  open: boolean
  employee: Employee | null
  onClose: () => void
  onFetchHistory: (employeeId: string) => Promise<{ history: SalaryHistoryEntry[] }>
  onRecordRevision: (employeeId: string, revision: NewSalaryRevisionInput) => Promise<any>
}

const FX_RATES_TO_USD: Record<string, number> = {
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.28,
  INR: 0.012,
  JPY: 0.0067,
  SGD: 0.75,
  CAD: 0.74
}

const REVISION_REASONS = [
  'Annual Merit & Performance Review',
  'Promotion / Level Advancement',
  'Market Rate Correction',
  'Equity & Internal Parity Adjustment',
  'Cost of Living Adjustment (COLA)',
  'Administrative / Data Correction'
]

export const SalaryHistoryModal: React.FC<SalaryHistoryModalProps> = ({
  open,
  employee,
  onClose,
  onFetchHistory,
  onRecordRevision
}) => {
  const [history, setHistory] = useState<SalaryHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Quick Revision Form State
  const [isAddingRevision, setIsAddingRevision] = useState<boolean>(false)
  const [newSalary, setNewSalary] = useState<string>('')
  const [selectedReason, setSelectedReason] = useState<string>(REVISION_REASONS[0]!)
  const [effectiveDate, setEffectiveDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  )
  const [notes, setNotes] = useState<string>('')

  const loadHistory = useCallback(async () => {
    if (!employee) return
    try {
      setIsLoading(true)
      setErrorMsg(null)
      const data = await onFetchHistory(employee.id)
      setHistory(data.history || [])
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load salary history timeline')
    } finally {
      setIsLoading(false)
    }
  }, [employee, onFetchHistory])

  useEffect(() => {
    if (open && employee) {
      loadHistory()
      setIsAddingRevision(false)
      setNewSalary('')
      setNotes('')
      setErrorMsg(null)
      setSuccessMsg(null)
    }
  }, [open, employee, loadHistory])

  const handleToggleAddForm = () => {
    if (!isAddingRevision && employee) {
      // Suggest a 10% raise by default as guidance
      const currentSalary = employee.baseSalary || employee.salary
      const suggested = Math.round(currentSalary * 1.1)
      setNewSalary(String(suggested))
      setIsAddingRevision(true)
    } else {
      setIsAddingRevision(false)
    }
  }

  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employee) return

    const salaryNum = parseFloat(newSalary)
    if (isNaN(salaryNum) || salaryNum <= 0) {
      setErrorMsg('Please enter a valid positive salary amount')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMsg(null)
      await onRecordRevision(employee.id, {
        newSalary: salaryNum,
        reason: selectedReason,
        effectiveDate: effectiveDate || new Date().toISOString(),
        changedBy: 'Archana Sekar (HR Manager)',
        notes: notes.trim() || undefined
      })

      setSuccessMsg('Salary revision successfully recorded in timeline!')
      setIsAddingRevision(false)
      await loadHistory()
      setTimeout(() => setSuccessMsg(null), 3500)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record salary revision')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!employee) return null

  const currency = employee.currency
  const currentSalary = employee.baseSalary || employee.salary
  const fxRate = FX_RATES_TO_USD[currency] || 1.0
  const currentSalaryUSD = Math.round(currentSalary * fxRate)
  const deptStyle = getDepartmentStyle(employee.department)

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
      {/* 1. Integrated Hero Profile Header (Symmetrical to PaySlipModal) */}
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
              {employee.jobTitle} • {employee.email} • ID: {employee.id.slice(0, 8)}
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

      {/* 2. Main Workstation Body (Compact Pearl Canvas) */}
      <DialogContent sx={{ p: 2, backgroundColor: '#f8f9fb', maxHeight: '76vh', overflowY: 'auto' }}>
        {/* Alerts */}
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 1.5, py: 0.3, px: 1.5, fontSize: '0.8125rem', borderRadius: '8px' }} onClose={() => setErrorMsg(null)}>
            {errorMsg}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" sx={{ mb: 1.5, py: 0.3, px: 1.5, fontSize: '0.8125rem', borderRadius: '8px' }} onClose={() => setSuccessMsg(null)}>
            {successMsg}
          </Alert>
        )}

        {/* Top Active Baseline Console */}
        <Box
          sx={{
            p: 1.5,
            mb: 1.75,
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #eef1f6',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5
          }}
        >
          {/* Left: Current Active Baseline */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                backgroundColor: '#e8f8f0',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Icon icon={AppIcon.PAYROLL} width="20" height="20" />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                  Current Active Salary (Latest Effective Record)
                </Typography>
                <Chip
                  label="Active Baseline"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    borderRadius: '4px'
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.25rem', lineHeight: 1.2 }}>
                  {formatCurrency(currentSalary, currency)}
                </Typography>
                {currency !== 'USD' && (
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.74rem' }}>
                    ≈ {formatCurrency(currentSalaryUSD, 'USD')} USD baseline (FX {fxRate}x)
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Right: Record Adjustment Trigger */}
          <Button
            size="small"
            variant={isAddingRevision ? 'outlined' : 'contained'}
            onClick={handleToggleAddForm}
            sx={{
              height: 32,
              px: 2,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.78rem',
              backgroundColor: isAddingRevision ? '#ffffff' : '#2563eb',
              color: isAddingRevision ? '#475569' : '#ffffff',
              borderColor: isAddingRevision ? '#cbd5e1' : 'transparent',
              '&:hover': {
                backgroundColor: isAddingRevision ? '#f8fafc' : '#1d4ed8'
              }
            }}
            startIcon={<Icon icon={isAddingRevision ? AppIcon.CLOSE : AppIcon.PLUS} width="14" height="14" />}
          >
            {isAddingRevision ? 'Cancel' : 'Record Salary Revision'}
          </Button>
        </Box>

        {/* Collapsible New Revision Quick-Console */}
        {isAddingRevision && (
          <Paper
            elevation={0}
            component="form"
            onSubmit={handleSubmitRevision}
            sx={{
              p: 1.75,
              mb: 1.75,
              borderRadius: '10px',
              border: '1px solid #bfdbfe',
              backgroundColor: '#f8faff',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.05)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.72rem' }}>
                New Salary Event Formulation
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                Will update active compensation & append to timeline
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1.2fr 1fr 1.5fr' }, gap: 1.25, mb: 1.25 }}>
              {/* 1. New Salary */}
              <TextField
                label="New Base Salary"
                size="small"
                type="number"
                value={newSalary}
                onChange={(e) => setNewSalary(e.target.value)}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>
                          {currency}
                        </Typography>
                      </InputAdornment>
                    )
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 34,
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    fontSize: '0.8rem'
                  }
                }}
              />

              {/* 2. Reason */}
              <FormControl size="small" required>
                <InputLabel id="revision-reason-label" sx={{ fontSize: '0.78rem' }}>
                  Adjustment Reason
                </InputLabel>
                <Select
                  labelId="revision-reason-label"
                  label="Adjustment Reason"
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  sx={{
                    height: 34,
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    fontSize: '0.8rem'
                  }}
                >
                  {REVISION_REASONS.map((reason) => (
                    <MenuItem key={reason} value={reason} sx={{ fontSize: '0.8rem' }}>
                      {reason}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* 3. Effective Date */}
              <TextField
                label="Effective Date"
                size="small"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                required
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 34,
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    fontSize: '0.8rem'
                  }
                }}
              />

              {/* 4. Justification Notes */}
              <TextField
                label="Notes / Rationale"
                size="small"
                placeholder="e.g. Q3 Promotion to Tech Lead"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 34,
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    fontSize: '0.8rem'
                  }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setIsAddingRevision(false)}
                sx={{
                  height: 28,
                  borderRadius: '6px',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  borderColor: '#cbd5e1',
                  color: '#475569'
                }}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                type="submit"
                disabled={isSubmitting}
                sx={{
                  height: 28,
                  px: 2,
                  borderRadius: '6px',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: '#2563eb',
                  '&:hover': { backgroundColor: '#1d4ed8' }
                }}
              >
                {isSubmitting ? 'Recording...' : 'Commit Revision'}
              </Button>
            </Box>
          </Paper>
        )}

        {/* 3. Timeline Console */}
        <Box
          sx={{
            p: 1.75,
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #eef1f6',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
          }}
        >
          {/* Console Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, pb: 1, borderBottom: '1px solid #f1f5f9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '6px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon icon={AppIcon.TIMELINE} width="15" height="15" />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#1e242e', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.72rem' }}>
                Audit Log & Historical Timeline ({history.length} Events)
              </Typography>
            </Box>

            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
              Chronological order (Newest first)
            </Typography>
          </Box>

          {/* Timeline Content */}
          {isLoading ? (
            <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={26} />
            </Box>
          ) : history.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                No historical salary changes recorded yet.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ position: 'relative', pl: 2.5 }}>
              {/* Vertical connector line */}
              <Box
                sx={{
                  position: 'absolute',
                  left: 9,
                  top: 10,
                  bottom: 10,
                  width: 2,
                  backgroundColor: '#e2e8f0'
                }}
              />

              {history.map((item, index) => {
                const isFirst = index === 0
                const isInitialOffer = item.oldAmount === 0 || item.reason.includes('Initial')
                const changePct = item.changePercent ?? 0
                const isPositiveChange = changePct > 0

                const formattedDate = new Date(item.effectiveDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })

                return (
                  <Box key={item.id} sx={{ position: 'relative', mb: 1.5, '&:last-child': { mb: 0 } }}>
                    {/* Compact Node Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: -20,
                        top: 7,
                        width: 20,
                        height: 20,
                        borderRadius: '6px',
                        backgroundColor: isFirst ? '#2563eb' : '#ffffff',
                        color: isFirst ? '#ffffff' : '#64748b',
                        border: isFirst ? '2px solid #2563eb' : '2px solid #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                      }}
                    >
                      <Icon icon={isInitialOffer ? AppIcon.CHECK : AppIcon.TRENDING_UP} width="11" height="11" />
                    </Box>

                    {/* Compact Event Card */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.25,
                        borderRadius: '8px',
                        border: isFirst ? '1px solid #bfdbfe' : '1px solid #eef1f6',
                        backgroundColor: isFirst ? '#f8faff' : '#ffffff',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          borderColor: '#cbd5e1',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                        }
                      }}
                    >
                      {/* Top Row: Event Header & Date */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e242e', fontSize: '0.84rem' }}>
                            {item.reason}
                          </Typography>
                          {isFirst && (
                            <Chip
                              label="Current Active"
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.64rem',
                                fontWeight: 700,
                                backgroundColor: '#dbeafe',
                                color: '#1d4ed8',
                                borderRadius: '4px'
                              }}
                            />
                          )}
                        </Box>

                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.72rem' }}>
                          Effective: {formattedDate}
                        </Typography>
                      </Box>

                      {/* Middle Row: Salary Amount Transition */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        {!isInitialOffer ? (
                          <>
                            <Typography variant="caption" sx={{ color: '#64748b', textDecoration: 'line-through', fontSize: '0.78rem' }}>
                              {formatCurrency(item.oldAmount, item.currency)}
                            </Typography>
                            <Icon icon="solar:arrow-right-linear" width="13" height="13" color="#94a3b8" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                              {formatCurrency(item.newAmount, item.currency)}
                            </Typography>
                            {changePct !== 0 && (
                              <Chip
                                label={`${isPositiveChange ? '+' : ''}${changePct}%`}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.66rem',
                                  fontWeight: 700,
                                  backgroundColor: isPositiveChange ? '#e8f8f0' : '#fee2e2',
                                  color: isPositiveChange ? '#10b981' : '#b91c1c',
                                  borderRadius: '4px'
                                }}
                              />
                            )}
                          </>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                              {formatCurrency(item.newAmount, item.currency)}
                            </Typography>
                            <Chip
                              label="Initial Offer Baseline"
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.66rem',
                                fontWeight: 600,
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                                borderRadius: '4px'
                              }}
                            />
                          </Box>
                        )}
                      </Box>

                      {/* Notes / Justification quote */}
                      {item.notes && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            color: '#475569',
                            fontStyle: 'italic',
                            fontSize: '0.72rem',
                            mb: 0.5,
                            backgroundColor: '#f8fafc',
                            px: 1,
                            py: 0.4,
                            borderRadius: '4px'
                          }}
                        >
                          "{item.notes}"
                        </Typography>
                      )}

                      {/* Bottom Row: Audit Metadata */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.35, borderTop: '1px dashed #f1f5f9' }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem' }}>
                          Authorized by: <Box component="span" sx={{ color: '#475569', fontWeight: 600 }}>{item.changedBy}</Box>
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem' }}>
                          Log ID: {item.id.slice(0, 8)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                )
              })}
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* 3. Compact Footer */}
      <DialogActions sx={{ py: 1.25, px: 2, borderTop: '1px solid #eef1f6', backgroundColor: '#ffffff' }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            height: 32,
            px: 2,
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: '0.78rem',
            fontWeight: 600,
            borderColor: '#e2e8f0',
            color: '#475569'
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
