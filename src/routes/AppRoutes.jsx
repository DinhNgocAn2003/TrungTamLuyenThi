import { Navigate, Route, Routes } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { CircularProgress, Box } from '@mui/material';

import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../layouts/AdminLayout';
import UserLayout from '../layouts/UserLayout';
import AuthLayout from '../layouts/AuthLayout';

// Lazy load components for better performance
const Login = lazy(() => import('../pages/auth/Login'));
const ChangePassword = lazy(() => import('../pages/auth/ChangePassword'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));

// Admin pages
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const SubjectManagement = lazy(() => import('../pages/admin/SubjectManagement'));
const ClassManagement = lazy(() => import('../pages/admin/ClassManagement'));
const StudentManagement = lazy(() => import('../pages/admin/StudentManagement'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const Attendance = lazy(() => import('../pages/admin/Attendance'));
const Payments = lazy(() => import('../pages/admin/Payments'));
const Reports = lazy(() => import('../pages/admin/Reports'));

// User pages
const UserDashboard = lazy(() => import('../pages/user/UserDashboard'));
const ClassRegistration = lazy(() => import('../pages/user/ClassRegistration'));
const UserAttendance = lazy(() => import('../pages/user/UserAttendance'));
const UserPayments = lazy(() => import('../pages/user/UserPayments'));
const ClassDetails = lazy(() => import('../pages/user/ClassDetails'));

// Loading fallback
const LoadingFallback = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh'
    }}
  >
    <CircularProgress />
  </Box>
);

// Protected route components
const AdminRoute = ({ children }) => {
  const { user, isLoading, isFirstLogin } = useAuth();
  
  if (isLoading) {
    return <LoadingFallback />;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (isFirstLogin) {
    return <Navigate to="/change-password" />;
  }
  
  const userRole = user.user_metadata?.role;
  if (userRole !== 'admin' && userRole !== 'teacher') {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

const UserRoute = ({ children }) => {
  const { user, isLoading, isFirstLogin } = useAuth();
  
  if (isLoading) {
    return <LoadingFallback />;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (isFirstLogin) {
    return <Navigate to="/change-password" />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { user, isFirstLogin, isLoading } = useAuth();
  
  // Redirect to change password if it's the first login
  useEffect(() => {
    if (user && isFirstLogin && window.location.pathname !== '/change-password') {
      window.location.href = '/change-password';
    }
  }, [user, isFirstLogin]);
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Auth routes */}
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<Navigate to="/login" />} />
          <Route path="login" element={<Login />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>
        
        {/* Admin routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="subjects" element={<SubjectManagement />} />
          <Route path="classes" element={<ClassManagement />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        
        {/* User routes */}
        <Route path="/user" element={
          <UserRoute>
            <UserLayout />
          </UserRoute>
        }>
          <Route index element={<Navigate to="/user/dashboard" />} />
          <Route path="" element={<UserDashboard />} />
          <Route path="class-registration" element={<ClassRegistration />} />
          <Route path="attendance" element={<UserAttendance />} />
          <Route path="payments" element={<UserPayments />} />
          <Route path="classes/:id" element={<ClassDetails />} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
