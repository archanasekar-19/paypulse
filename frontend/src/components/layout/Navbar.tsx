import React from 'react'
import { AppBar, Toolbar, Box, Typography, Chip, Avatar, Tooltip, Button } from '@mui/material'
import { Icon } from '@iconify/react'
import { AppIcon } from '../../constants/icons'
import type { AuthUser } from '../../types'

interface NavbarProps {
  currentUser?: AuthUser | null
  organizationName?: string
  userName?: string
  userRole?: string
  onLogout?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  organizationName = 'ACME Corp • Global',
  userName,
  userRole,
  onLogout
}) => {
  const activeName = currentUser?.name || userName || 'Archana Sekar'
  const activeRole = currentUser?.role || userRole || 'HR Manager'
  const activeOrg = currentUser?.organization || organizationName

  const initials = activeName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #eef1f6',
        color: '#1e242e',
        width: '100%',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)'
      }}
    >
      <Toolbar sx={{ height: 62, px: { xs: 2, sm: 4, md: 5 }, justifyContent: 'space-between' }}>
        {/* Brand Logo & Title with iLovePDF Coral/Red Accent */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: '#fff0ee',
              color: '#ff5442',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon icon={AppIcon.PAYROLL} width="22" height="22" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.15, color: '#1e242e', fontSize: '1.1rem' }}>
              PayPulse
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>
              Global Compensation & Payroll Hub
            </Typography>
          </Box>
        </Box>

        {/* Org Status Badge, User Profile & Logout Action */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            icon={<Icon icon={AppIcon.BUILDINGS} width="15" height="15" />}
            label={activeOrg}
            size="small"
            sx={{
              border: '1px solid #eef1f6',
              fontWeight: 600,
              color: '#475569',
              backgroundColor: '#f8fafc',
              height: 28,
              borderRadius: '6px',
              fontSize: '0.75rem',
              display: { xs: 'none', sm: 'inline-flex' }
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                fontSize: '0.8125rem',
                fontWeight: 700,
                border: '1px solid #bfdbfe'
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.15, fontSize: '0.8125rem', color: '#1e242e' }}>
                {activeName}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                {activeRole}
              </Typography>
            </Box>
          </Box>

          {onLogout && (
            <Tooltip title="Log out of session">
              <Button
                size="small"
                variant="outlined"
                onClick={onLogout}
                startIcon={<Icon icon={AppIcon.LOGOUT} width="15" height="15" />}
                sx={{
                  height: 30,
                  px: 1.25,
                  borderRadius: '6px',
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  backgroundColor: '#f8fafc',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#fff0ee',
                    borderColor: '#ffc7c2',
                    color: '#ff5442'
                  }
                }}
              >
                Sign Out
              </Button>
            </Tooltip>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
