import type React from 'react'
import { Grid, Paper, Box, Typography } from '@mui/material'
import { Icon } from '@iconify/react'
import type { KpiMetrics } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface KpiCardsProps {
  metrics: KpiMetrics
  isLoading?: boolean
}

interface MetricCardItem {
  id: string
  title: string
  value: string
  subtitle: string
  icon: string
  accentColor: string
  accentBg: string
}

export const KpiCards: React.FC<KpiCardsProps> = ({ metrics }) => {
  const cards: MetricCardItem[] = [
    {
      id: 'total-payroll',
      title: 'Total Annual Payroll',
      value: formatCurrency(metrics.totalPayrollUSD, 'USD'),
      subtitle: 'Normalized USD baseline',
      icon: 'solar:banknote-2-linear',
      accentColor: '#2563eb',
      accentBg: '#eff6ff'
    },
    {
      id: 'headcount',
      title: 'Global Headcount',
      value: metrics.totalEmployees.toLocaleString(),
      subtitle: 'Across 7 operating countries',
      icon: 'solar:users-group-two-rounded-linear',
      accentColor: '#10b981',
      accentBg: '#ecfdf5'
    },
    {
      id: 'avg-salary',
      title: 'Average Salary',
      value: formatCurrency(metrics.averageSalaryUSD, 'USD'),
      subtitle: 'Org-wide mean compensation',
      icon: 'solar:chart-2-linear',
      accentColor: '#7e22ce',
      accentBg: '#faf5ff'
    },
    {
      id: 'median-salary',
      title: 'Median Salary',
      value: formatCurrency(metrics.medianSalaryUSD, 'USD'),
      subtitle: 'Middle-earner benchmark',
      icon: 'solar:scale-linear',
      accentColor: '#b45309',
      accentBg: '#fffbeb'
    }
  ]

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {cards.map((card) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.id}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)'
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {card.title}
              </Typography>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  backgroundColor: card.accentBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.accentColor
                }}
              >
                <Icon icon={card.icon} width="22" height="22" />
              </Box>
            </Box>

            <Box>
              <Typography variant="h5" color="text.primary" sx={{ fontWeight: 700 }}>
                {card.value}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {card.subtitle}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}
