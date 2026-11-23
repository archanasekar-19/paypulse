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
      main: '#ff5442', // Warm coral accent (iLovePDF style)
      light: '#ff8a7a',
      dark: '#e03a29',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f8f9fb', // Soothing pearl-slate background (eye-comfortable)
      paper: '#ffffff'
    },
    text: {
      primary: '#1e242e', // Deep friendly charcoal (softer on eyes than pure black)
      secondary: '#64748b' // Balanced muted slate for subtext
    },
    success: {
      main: '#10b981',
      light: '#e8f8f0'
    },
    warning: {
      main: '#f59e0b',
      light: '#fef9c3'
    },
    error: {
      main: '#ef4444',
      light: '#fee2e2'
    },
    info: {
      main: '#0284c7',
      light: '#e0f2fe'
    }
  },
  typography: {
    fontFamily: [
      '"Plus Jakarta Sans"',
      '"Inter"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.025em',
      color: '#1e242e'
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#1e242e'
    },
    h6: {
      fontWeight: 700,
      letterSpacing: '-0.015em',
      color: '#1e242e'
    },
    subtitle1: {
      fontWeight: 600,
      letterSpacing: '-0.01em'
    },
    subtitle2: {
      fontWeight: 600
    },
    body1: {
      fontSize: '0.925rem',
      lineHeight: 1.5
    },
    body2: {
      fontSize: '0.825rem',
      lineHeight: 1.45
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4
    },
    button: {
      textTransform: 'none',
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
          border: '1px solid #eef1f6',
          borderRadius: 14
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Clean rounded square (no circle or oval radius)
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)'
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#f1f5f9',
          padding: '10px 14px', // Compact, comfortable vertical rhythm
          fontSize: '0.84rem'
        },
        head: {
          backgroundColor: '#f8fafc',
          color: '#475569',
          fontWeight: 700,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6 // Clean rounded square for tags & chips
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff'
          }
        }
      }
    }
  }
})
