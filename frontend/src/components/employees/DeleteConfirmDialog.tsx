import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress
} from '@mui/material'
import { Icon } from '@iconify/react'
import type { Employee } from '../../types'

interface DeleteConfirmDialogProps {
  open: boolean
  employee: Employee | null
  onClose: () => void
  onConfirm: (id: string) => Promise<void>
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  employee,
  onClose,
  onConfirm
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!employee) return null

  const handleConfirm = async () => {
    try {
      setIsDeleting(true)
      await onConfirm(employee.id)
      setIsDeleting(false)
      onClose()
    } catch {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon icon="solar:danger-triangle-bold" width="22" height="22" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Confirm Deletion
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Are you sure you want to remove <strong>{employee.name}</strong> ({employee.email}) from the global compensation roster?
        </Typography>
        <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 1.5, fontWeight: 500 }}>
          This will permanently delete their salary record from the database.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={isDeleting}
          startIcon={
            isDeleting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Icon icon="solar:trash-bin-trash-linear" width="18" height="18" />
            )
          }
        >
          {isDeleting ? 'Deleting...' : 'Delete Employee'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
