import React from 'react'
import { Container, Typography, Button, Box, Paper } from '@mui/material'
import { Icon } from '@iconify/react'

function App() {
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        {/* Lightweight Iconify icon */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Icon icon="solar:wallet-money-bold-duotone" width="56" height="56" color="#1976d2" />
        </Box>

        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          PayPulse
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Global Salary Management & Compensation Intelligence (10,000 Employees)
        </Typography>

        <Button variant="contained" color="primary" size="large">
          Material UI & Iconify Ready
        </Button>
      </Paper>
    </Container>
  )
}

export default App