import React from 'react'
import { AppBar, Toolbar, Box, Typography, Chip, Avatar } from '@mui/material'
import { Icon } from '@iconify/react'

interface NavbarProps {
  organizationName?: string
  userName?: string
  userRole?: string
}

export const Navbar: React.FC<NavbarProps> = ({
  organizationName = 'ACME Corp • Global',
  userName = 'Elena Vance',
  userRole = 'HR Manager'
}) => {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        color: '#0f172a',
        width: '100%'
      }}
    >
      <Toolbar sx={{ height: 70, px: { xs: 2, sm: 4, md: 6 }, justifyContent: 'space-between' }}>
        {/* Brand Logo & Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 4px -1px rgba(37, 99, 235, 0.2)'
            }}
          >
            <Icon icon="solar:wallet-money-bold-duotone" width="26" height="26" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              PayPulse
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Global Compensation Platform
            </Typography>
          </Box>
        </Box>

        {/* Org Status Badge & User Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={<Icon icon="solar:buildings-2-linear" width="16" height="16" />}
            label={organizationName}
            variant="outlined"
            size="small"
            sx={{
              borderColor: '#cbd5e1',
              fontWeight: 600,
              color: '#475569',
              backgroundColor: '#f8fafc'
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                backgroundColor: '#eff6ff',
                color: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 700,
                border: '1.5px solid #bfdbfe'
              }}
            >
              EV
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {userName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userRole}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
