import React from 'react'
import { Container, Typography, Button, Box, Paper } from '@mui/material'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'

function App() {
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <AccountBalanceWalletIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          PayPulse
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Global Salary Management & Compensation Intelligence (10,000 Employees)
        </Typography>
        <Button variant="contained" color="primary" size="large">
          Material UI Ready
        </Button>
      </Paper>
    </Container>
  )
}

export default App