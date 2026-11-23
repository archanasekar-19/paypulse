import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox
} from '@mui/material'
import { Icon } from '@iconify/react'
import { AppIcon } from '../../constants/icons'
import { api } from '../../services/api'
import type { AuthUser } from '../../types'

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  // Pre-configured default credentials from environment
  const envUsername = import.meta.env.VITE_AUTH_USERNAME || 'archanakmhss@gmail.com'
  const envPassword = import.meta.env.VITE_AUTH_PASSWORD || 'paypulse2026'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmedUser = username.trim()
    const trimmedPass = password.trim()

    if (!trimmedUser || !trimmedPass) {
      setErrorMessage('Please enter both username and password.')
      return
    }

    setIsLoading(true)

    try {
      // 1. Attempt backend authentication
      const response = await api.post('/auth/login', {
        username: trimmedUser,
        password: trimmedPass
      })

      if (response.data?.success && response.data?.user) {
        const authUser: AuthUser = response.data.user
        if (rememberMe) {
          localStorage.setItem('paypulse_auth_user', JSON.stringify(authUser))
        } else {
          sessionStorage.setItem('paypulse_auth_user', JSON.stringify(authUser))
        }
        onLoginSuccess(authUser)
        return
      } else {
        setErrorMessage(response.data?.error || 'Invalid credentials. Please verify your login.')
      }
    } catch (err: any) {
      // 2. Fallback client-side env verification if backend is offline or returned 401
      if (err.response?.status === 401) {
        setErrorMessage(err.response?.data?.error || 'Invalid username or password. Check credentials.')
      } else {
        // Fallback check against frontend environment variables
        const isClientValidUser =
          trimmedUser.toLowerCase() === envUsername.toLowerCase() ||
          trimmedUser.toLowerCase() === 'archana' ||
          trimmedUser.toLowerCase() === 'admin'
        const isClientValidPass = trimmedPass === envPassword

        if (isClientValidUser && isClientValidPass) {
          const authUser: AuthUser = {
            name: 'Archana Sekar',
            email: 'archanakmhss@gmail.com',
            role: 'HR Manager',
            organization: 'ACME Corp • Global'
          }
          if (rememberMe) {
            localStorage.setItem('paypulse_auth_user', JSON.stringify(authUser))
          } else {
            sessionStorage.setItem('paypulse_auth_user', JSON.stringify(authUser))
          }
          onLoginSuccess(authUser)
          return
        }

        setErrorMessage(
          err.response?.data?.error ||
          'Invalid username or password. Please use the credentials specified in .env'
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#f8f9fb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2.5,
        py: 4
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 3.5, sm: 4.5 },
          borderRadius: '14px',
          border: '1px solid #eef1f6',
          boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.05)',
          backgroundColor: '#ffffff'
        }}
      >
        {/* Brand Header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3.5, textAlign: 'center' }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '12px',
              backgroundColor: '#fff0ee',
              color: '#ff5442',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1.5,
              boxShadow: '0 4px 14px rgba(255, 84, 66, 0.15)'
            }}
          >
            <Icon icon={AppIcon.PAYROLL} width="30" height="30" />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: '#1e242e',
              letterSpacing: '-0.025em',
              mb: 0.5
            }}
          >
            PayPulse
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>
            Global Compensation & Payroll Hub
          </Typography>
        </Box>

        {/* Section Heading */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e242e', mb: 0.5 }}>
            Sign in to your account
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8125rem' }}>
            Authorized HR & Payroll Administration Portal
          </Typography>
        </Box>

        {/* Error Alert */}
        {errorMessage && (
          <Alert
            severity="error"
            onClose={() => setErrorMessage(null)}
            sx={{
              mb: 2.5,
              borderRadius: '8px',
              fontSize: '0.8125rem',
              py: 0.5
            }}
          >
            {errorMessage}
          </Alert>
        )}

        {/* Login Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{ display: 'block', mb: 0.75, fontWeight: 700, color: '#334155', fontSize: '0.75rem' }}
            >
              Username / Work Email
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. archanakmhss@gmail.com"
              autoComplete="username"
              disabled={isLoading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon icon={AppIcon.USER} width="17" height="17" color="#94a3b8" />
                    </InputAdornment>
                  ),
                  sx: {
                    height: 42,
                    fontSize: '0.875rem',
                    borderRadius: '8px'
                  }
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{ display: 'block', mb: 0.75, fontWeight: 700, color: '#334155', fontSize: '0.75rem' }}
            >
              Password
            </Typography>
            <TextField
              fullWidth
              size="small"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              disabled={isLoading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon icon={AppIcon.LOCK} width="17" height="17" color="#94a3b8" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        tabIndex={-1}
                        sx={{ color: '#94a3b8' }}
                      >
                        <Icon icon={showPassword ? AppIcon.EYE_CLOSED : AppIcon.EYE} width="18" height="18" />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    height: 42,
                    fontSize: '0.875rem',
                    borderRadius: '8px'
                  }
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{
                    color: '#cbd5e1',
                    '&.Mui-checked': {
                      color: '#ff5442'
                    }
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: '#64748b' }}>
                  Remember me
                </Typography>
              }
              sx={{ mr: 0 }}
            />
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              height: 42,
              borderRadius: '8px',
              backgroundColor: '#ff5442',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '-0.01em',
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(255, 84, 66, 0.25)',
              '&:hover': {
                backgroundColor: '#e03a29',
                boxShadow: '0 6px 16px rgba(255, 84, 66, 0.35)'
              }
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={18} color="inherit" />
                <span>Signing in...</span>
              </Box>
            ) : (
              'Log In'
            )}
          </Button>
        </Box>
      </Paper>

      {/* Footer Note */}
      <Typography variant="caption" sx={{ color: '#94a3b8', mt: 3, fontSize: '0.75rem' }}>
        PayPulse Global Payroll System • Protected Session
      </Typography>
    </Box>
  )
}
