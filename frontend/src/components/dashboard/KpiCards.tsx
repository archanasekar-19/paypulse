import type React from 'react'
import { Grid, Paper, Box, Typography, Skeleton } from '@mui/material'
import { Icon } from '@iconify/react'
import { AppIcon } from '../../constants/icons'
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

export const KpiCards: React.FC<KpiCardsProps> = ({ metrics, isLoading = false }) => {
  const cards: MetricCardItem[] = [
    {
      id: 'total-payroll',
      title: 'Total Annual Payroll',
      value: formatCurrency(metrics.totalPayrollUSD, 'USD'),
      subtitle: 'Global normalized USD compensation baseline',
      icon: AppIcon.PAYROLL,
      accentColor: '#ff5442', // iLovePDF Coral Red
      accentBg: '#fff0ee'
    },
    {
      id: 'headcount',
      title: 'Global Headcount',
      value: `${metrics.totalEmployees.toLocaleString()} Staff`,
      subtitle: 'Across 7 international operating countries',
      icon: AppIcon.HEADCOUNT,
      accentColor: '#10b981', // iLovePDF Emerald Green
      accentBg: '#e8f8f0'
    },
    {
      id: 'avg-salary',
      title: 'Average Base Salary',
      value: formatCurrency(metrics.averageSalaryUSD, 'USD'),
      subtitle: 'Mean normalized organizational compensation',
      icon: AppIcon.CHART,
      accentColor: '#2563eb', // iLovePDF Doc Blue
      accentBg: '#eff6ff'
    },
    {
      id: 'median-salary',
      title: 'Median Compensation',
      value: formatCurrency(metrics.medianSalaryUSD, 'USD'),
      subtitle: 'Middle-earner standard benchmark',
      icon: AppIcon.SCALE,
      accentColor: '#f59e0b', // iLovePDF Amber Gold
      accentBg: '#fef9c3'
    }
  ]

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((card) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.id}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '14px',
              border: '1px solid #eef1f6',
              backgroundColor: '#ffffff',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
              cursor: 'default',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 18px -4px rgba(15, 23, 42, 0.08)',
                borderColor: '#e2e8f0'
              }
            }}
          >
            {/* Top Row: Icon Badge (iLovePDF signature rounded-square) */}
            <Box sx={{ mb: 1.75 }}>
              {isLoading ? (
                <Skeleton
                  variant="rounded"
                  width={44}
                  height={44}
                  animation="wave"
                  sx={{ borderRadius: '10px' }}
                />
              ) : (
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '10px',
                    backgroundColor: card.accentBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: card.accentColor,
                    transition: 'transform 0.18s ease'
                  }}
                >
                  <Icon icon={card.icon} width="24" height="24" />
                </Box>
              )}
            </Box>

            {/* Content: Title -> Value -> Subtext */}
            <Box>
              {isLoading ? (
                <>
                  <Skeleton
                    variant="text"
                    width="65%"
                    height={22}
                    animation="wave"
                    sx={{ mb: 0.5, borderRadius: '4px' }}
                  />
                  <Skeleton
                    variant="text"
                    width="85%"
                    height={38}
                    animation="wave"
                    sx={{ mb: 0.5, borderRadius: '6px' }}
                  />
                  <Skeleton
                    variant="text"
                    width="95%"
                    height={18}
                    animation="wave"
                    sx={{ borderRadius: '4px' }}
                  />
                </>
              ) : (
                <>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: '#1e242e',
                      fontSize: '0.925rem',
                      lineHeight: 1.25,
                      mb: 0.5
                    }}
                  >
                    {card.title}
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      color: '#0f172a',
                      fontSize: '1.4rem',
                      lineHeight: 1.2,
                      letterSpacing: '-0.02em',
                      mb: 0.5
                    }}
                  >
                    {card.value}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748b',
                      fontSize: '0.75rem',
                      lineHeight: 1.35,
                      display: 'block'
                    }}
                  >
                    {card.subtitle}
                  </Typography>
                </>
              )}
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}
