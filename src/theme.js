import { createTheme } from '@mui/material/styles';

// Educational color palette - friendly, professional, and accessible
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e88e5', // Bright blue - trust, knowledge, stability
      light: '#6bb6ff',
      dark: '#005cb2',
      contrastText: '#fff',
    },
    secondary: {
      main: '#26a69a', // Teal green - growth, success, nature
      light: '#64d8cb',
      dark: '#00766c',
      contrastText: '#fff',
    },
    background: {
      default: '#f8fafb', // Very light blue-grey
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50', // Dark blue-grey for better readability
      secondary: '#546e7a',
    },
    success: {
      main: '#66bb6a', // Friendly green
      light: '#98ee99',
      dark: '#338a3e',
    },
    warning: {
      main: '#ffa726', // Warm orange
      light: '#ffd95a',
      dark: '#c77800',
    },
    error: {
      main: '#ef5350', // Soft red
      light: '#ff867f',
      dark: '#b61827',
    },
    info: {
      main: '#42a5f5', // Light blue
      light: '#80d6ff',
      dark: '#0077c2',
    },
    // Custom educational colors
    education: {
      primary: '#1e88e5',    // Blue - Knowledge & Trust
      secondary: '#4caf50',  // Green - Growth & Success  
      teacher: '#2196f3',    // Light Blue - Teacher role
      student: '#4caf50',    // Green - Student role
      admin: '#f44336',      // Red - Admin role
      accent: '#9c27b0',     // Purple for highlights
      gold: '#ff9800',       // Orange for achievements
      lightBlue: '#e3f2fd',
      lightGreen: '#e8f5e8',
      lightPurple: '#f3e5f5',
      lightOrange: '#fff3e0',
      lightRed: '#ffebee',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Segoe UI", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#2c3e50',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#2c3e50',
    },
    h3: {
      fontSize: '1.8rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#2c3e50',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#2c3e50',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#2c3e50',
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#2c3e50',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#2c3e50',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#546e7a',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.95rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          padding: '10px 20px',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #26a69a 0%, #00695c 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #00695c 0%, #004d40 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: 16,
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1e88e5',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1e88e5',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f8fafb',
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: '#2c3e50',
            borderBottom: '2px solid #e0e0e0',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(30, 136, 229, 0.04)',
          },
          '&:nth-of-type(even)': {
            backgroundColor: 'rgba(248, 250, 251, 0.5)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: '#e3f2fd',
          color: '#1565c0',
        },
        colorSecondary: {
          backgroundColor: '#e0f2f1',
          color: '#00695c',
        },
      },
    },
  },
});

export default theme;
