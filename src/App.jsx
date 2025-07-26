import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

// Import các component trang
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import Login from './pages/auth/Login';
import ResetPassword from './pages/auth/ResetPassword';
import ForgotPassword from './pages/auth/ForgotPassword';
import AdminDashboard from './pages/admin/Dashboard';
import Classes from './pages/admin/ClassManagement';
import Students from './pages/admin/StudentManagement';
import Payments from './pages/admin/Payments';
import Reports from './pages/admin/Reports';
import UserManagement from './pages/admin/UserManagement';
import UserDashboard from './pages/user/UserDashboard';
import UserClasses from './pages/user/ClassRegistration';
import UserAttendance from './pages/user/UserAttendance';
import ChangePassword from './pages/auth/ChangePassword';
import UserPayments from './pages/user/UserPayments';
// import UserGrades from './pages/user/Grades';
// import UserProfile from './pages/user/Profile';
import NotFound from './pages/NotFound';

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
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path='/forgot-password'element={<ForgotPassword />} />
                  <Route path="change-password" element={<ChangePassword />} />                 

                  {/* Protected Admin Routes */}
                  <Route 
                    path="/admin" 
                    element={
                      <AdminLayout />
                    }
                  >
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="classes" element={<Classes />} />
                    <Route path="students" element={<Students />} />
                    <Route path="payments" element={<Payments />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="users" element={<UserManagement />} />
                  </Route>

                  {/* Protected Student Routes */}
                  <Route 
                    path="/student" 
                    element={
                      <UserLayout />
                    }
                  >
                    <Route index element={<Navigate to="/student/dashboard" replace />} />
                    <Route path="dashboard" element={<UserDashboard />} />
                    <Route path="classes" element={<UserClasses />} />
                    <Route path="attendance" element={<UserAttendance />} />
                    <Route path="payments" element={<UserPayments />} />
                  </Route>

                  {/* Protected Teacher Routes */}
                  <Route 
                    path="/teacher" 
                    element={
                      <UserLayout />
                    }
                  >
                    <Route index element={<Navigate to="/teacher/dashboard" replace />} />
                    <Route path="dashboard" element={<UserDashboard />} />
                    <Route path="classes" element={<UserClasses />} />
                    <Route path="attendance" element={<UserAttendance />} />
                    <Route path="payments" element={<UserPayments />} />
                  </Route>

                  {/* Legacy User Routes - redirect to role-specific routes */}
                  <Route 
                    path="/user/*" 
                    element={<Navigate to="/login" replace />}
                  />

                  {/* Redirects based on auth status */}
                  <Route 
                    path="/" 
                    element={
                      <Navigate to="/login" replace />
                    } 
                  />

                  {/* 404 Page */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
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