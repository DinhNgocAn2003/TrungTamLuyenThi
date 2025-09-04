import { Routes, Route } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import 'dayjs/locale/vi';

import { AuthProvider } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { NotificationProvider } from './contexts/NotificationContext';
import LoadingBackdrop from './components/common/LoadingBackdrop';
import NotificationSnackbar from './components/common/NotificationSnackbar';
import AppRoutes from './routes/AppRoutes';

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
        {/* <BrowserRouter> */}
          <LoadingProvider>
            <NotificationProvider>
              <AuthProvider>
                <AppRoutes />
                <LoadingBackdrop />
                <NotificationSnackbar />
              </AuthProvider>
            </NotificationProvider>
          </LoadingProvider>
        {/* </BrowserRouter> */}
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;