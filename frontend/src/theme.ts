import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Modern vibrant royal blue
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#0ea5e9', // Sky blue accent
      light: '#38bdf8',
      dark: '#0284c7'
    },
    background: {
      default: '#f8fafc', // Soft modern slate-gray background
      paper: '#ffffff'
    },
    text: {
      primary: '#0f172a', // Deep slate for crisp readability
      secondary: '#64748b' // Muted slate for subtext
    },
    success: {
      main: '#10b981',
      light: '#d1fae5'
    },
    info: {
      main: '#6366f1',
      light: '#e0e7ff'
    }
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#0f172a'
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: '#0f172a'
    },
    subtitle1: {
      fontWeight: 600
    },
    subtitle2: {
      fontWeight: 500
    },
    button: {
      textTransform: 'none',
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 10
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
          border: '1px solid #e2e8f0'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#f1f5f9',
          padding: '14px 16px'
        },
        head: {
          backgroundColor: '#f8fafc',
          color: '#475569',
          fontWeight: 600,
          fontSize: '0.8125rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6
        }
      }
    }
  }
})
