import React from 'react'
import { AppBar, Toolbar, Box, Typography, Chip, Avatar } from '@mui/material'
import { Icon } from '@iconify/react'
import { AppIcon } from '../../constants/icons'

interface NavbarProps {
  organizationName?: string
  userName?: string
  userRole?: string
}

export const Navbar: React.FC<NavbarProps> = ({
  organizationName = 'ACME Corp • Global',
  userName = 'Archana Sekar',
  userRole = 'HR Manager'
}) => {
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

        {/* Org Status Badge & User Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            icon={<Icon icon={AppIcon.BUILDINGS} width="15" height="15" />}
            label={organizationName}
            size="small"
            sx={{
              border: '1px solid #eef1f6',
              fontWeight: 600,
              color: '#475569',
              backgroundColor: '#f8fafc',
              height: 28,
              borderRadius: '6px',
              fontSize: '0.75rem'
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
              {userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.15, fontSize: '0.8125rem', color: '#1e242e' }}>
                {userName}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                {userRole}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
