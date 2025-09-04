import { createTheme } from '@mui/material/styles';

// Educational color palette - gentle, soothing, and accessible
const theme = createTheme({
  palette: {
    primary: {
      main: '#5c9bd5', // Softer blue - calm, trustworthy
      light: '#8bb8e8',
      dark: '#3a7bc8',
      contrastText: '#fff',
    },
    secondary: {
      main: '#70a288', // Muted sage green - peaceful, balanced
      light: '#9bc5a4',
      dark: '#4a7c59',
      contrastText: '#fff',
    },
    background: {
      default: '#fafbfc', // Softer light grey-blue
      paper: '#ffffff',
    },
    text: {
      primary: '#3d4852', // Softer dark grey for better readability
      secondary: '#6b7280',
    },
    success: {
      main: '#81c784', // Gentle green
      light: '#a5d6a7',
      dark: '#4caf50',
    },
    warning: {
      main: '#ffb74d', // Soft warm orange
      light: '#ffcc80',
      dark: '#ff9800',
    },
    error: {
      main: '#e57373', // Muted coral red
      light: '#ef9a9a',
      dark: '#c62828',
    },
    info: {
      main: '#64b5f6', // Gentle sky blue
      light: '#90caf9',
      dark: '#1976d2',
    },
    // Custom educational colors - all softened
    education: {
      primary: '#5c9bd5',    // Soft blue - Knowledge & Trust
      secondary: '#81c784',  // Gentle green - Growth & Success  
      teacher: '#7bb3f0',    // Soft light blue - Teacher role
      student: '#81c784',    // Gentle green - Student role
      admin: '#e57373',      // Muted coral - Admin role
      accent: '#ba68c8',     // Soft purple for highlights
      gold: '#ffc107',       // Warm golden yellow for achievements
      lightBlue: '#e8f4fd',
      lightGreen: '#f1f8e9',
      lightPurple: '#f8f3ff',
      lightOrange: '#fff8e1',
      lightRed: '#ffeaea',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Segoe UI", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600, // Lighter weight
      lineHeight: 1.2,
      color: '#3d4852', // Softer color
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500, // Lighter weight
      lineHeight: 1.3,
      color: '#3d4852',
    },
    h3: {
      fontSize: '1.8rem',
      fontWeight: 500,
      lineHeight: 1.3,
      color: '#3d4852',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
      color: '#3d4852',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
      color: '#3d4852',
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 500,
      lineHeight: 1.4,
      color: '#3d4852',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#3d4852',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#6b7280',
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
          backgroundColor: '#5c9bd5',
          '&:hover': {
            backgroundColor: '#4a90d9',
          },
        },
        containedSecondary: {
          backgroundColor: '#70a288',
          '&:hover': {
            backgroundColor: '#5d8a73',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', // Softer shadow
          border: '1px solid rgba(0, 0, 0, 0.03)', // Lighter border
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)', // Softer hover shadow
            transform: 'translateY(-1px)', // Less movement
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
              borderColor: '#5c9bd5', // Softer blue
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#5c9bd5', // Softer blue
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
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', // Softer shadow
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#fafbfc', // Softer background
          '& .MuiTableCell-head': {
            fontWeight: 500, // Lighter weight
            color: '#3d4852', // Softer color
            borderBottom: '1px solid #e5e7eb', // Lighter border
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(92, 155, 213, 0.03)', // Softer hover
          },
          '&:nth-of-type(even)': {
            backgroundColor: 'rgba(250, 251, 252, 0.3)', // Softer striping
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
          backgroundColor: '#e8f4fd', // Softer background
          color: '#3a7bc8', // Softer text
        },
        colorSecondary: {
          backgroundColor: '#f1f8e9', // Softer background
          color: '#4a7c59', // Softer text
        },
      },
    },
  },
});

export default theme;
