import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  MenuItem,
  CircularProgress
} from '@mui/material'
import { Icon } from '@iconify/react'
import { AppIcon } from '../../constants/icons'
import type { Employee } from '../../types'

interface DeleteConfirmDialogProps {
  open: boolean
  employee: Employee | null
  onClose: () => void
  onConfirm: (id: string, reason?: string) => Promise<void>
}

const DEACTIVATION_REASONS = [
  'Voluntary Resignation',
  'Contract Completion / Offboarded',
  'Position Elimination / Restructuring',
  'Transfer to Global Subsidiary',
  'Performance-related Separation',
  'Other / Administrative Deactivation'
]

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  employee,
  onClose,
  onConfirm
}) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedReason, setSelectedReason] = useState(DEACTIVATION_REASONS[1])
  const [customNotes, setCustomNotes] = useState('')

  if (!employee) return null

  const handleConfirm = async () => {
    try {
      setIsDeleting(true)
      const auditReason = customNotes.trim()
        ? `${selectedReason} - ${customNotes.trim()}`
        : selectedReason
      await onConfirm(employee.id, auditReason)
      setIsDeleting(false)
      onClose()
    } catch {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
          }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1, pt: 2.5, px: 3 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '8px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Icon icon={AppIcon.USER_INACTIVE} width="22" height="22" />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e242e', lineHeight: 1.2 }}>
            Deactivate Employee Record
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.78rem' }}>
            Mark employee inactive while preserving full audit trail
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Typography variant="body2" sx={{ color: '#334155', mb: 2, lineHeight: 1.5 }}>
          Are you sure you want to deactivate <strong>{employee.name}</strong> ({employee.email})?
        </Typography>

        {/* Audit Compliance Notice Box */}
        <Box
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            gap: 1.25,
            alignItems: 'flex-start'
          }}
        >
          <Box sx={{ color: '#0284c7', mt: 0.25, flexShrink: 0 }}>
            <Icon icon={AppIcon.INFO} width="18" height="18" />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>
              Statutory Compliance & Data Retention
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', lineHeight: 1.45, display: 'block', mt: 0.5 }}>
              This record will be safely marked as <strong>INACTIVE</strong>. The employee record and entire salary revision timeline are retained in the database for regulatory compliance, while excluding them from active payroll rosters and company KPI aggregations.
            </Typography>
          </Box>
        </Box>

        {/* Reason Selection */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Deactivation / Offboarding Reason"
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                fontSize: '0.875rem'
              }
            }}
          >
            {DEACTIVATION_REASONS.map((r) => (
              <MenuItem key={r} value={r} sx={{ fontSize: '0.85rem' }}>
                {r}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            size="small"
            label="Audit Notes (Optional)"
            placeholder="e.g. Completed exit interviews; final settlement pending."
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                fontSize: '0.875rem'
              }
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #f1f5f9', gap: 1 }}>
        <Button
          onClick={onClose}
          color="inherit"
          disabled={isDeleting}
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={isDeleting}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
            backgroundColor: '#dc2626',
            '&:hover': { backgroundColor: '#b91c1c' }
          }}
          startIcon={
            isDeleting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Icon icon={AppIcon.USER_INACTIVE} width="16" height="16" />
            )
          }
        >
          {isDeleting ? 'Deactivating...' : 'Deactivate Employee'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
