import { Navigate, Route, Routes } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { CircularProgress, Box } from '@mui/material';

import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../layouts/AdminLayout';
import UserLayout from '../layouts/UserLayout';
import TeacherLayout from '../layouts/TeacherLayout';
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
const TeacherManagement = lazy(() => import('../pages/admin/TeacherManagement'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const Attendance = lazy(() => import('../pages/admin/Attendance'));
const Payments = lazy(() => import('../pages/admin/Payments'));
const Reports = lazy(() => import('../pages/admin/Reports'));

// Teacher pages
const TeacherDashboard = lazy(() => import('../pages/teacher/TeacherDashboard'));
const TeacherClasses = lazy(() => import('../pages/teacher/TeacherClasses'));
const TeacherAttendance = lazy(() => import('../pages/teacher/TeacherAttendance'));
const TeacherTests = lazy(() => import('../pages/teacher/TeacherTests'));
const TeacherGrades = lazy(() => import('../pages/teacher/TeacherGrades'));

// Student pages
const StudentDashboard = lazy(() => import('../pages/user/UserDashboard'));
const ClassRegistration = lazy(() => import('../pages/user/ClassRegistration'));
const StudentAttendance = lazy(() => import('../pages/user/UserAttendance'));
const StudentPayments = lazy(() => import('../pages/user/UserPayments'));
const ClassDetails = lazy(() => import('../pages/user/ClassDetails'));

// 404 and Unauthorized pages
const NotFound = lazy(() => import('../pages/NotFound'));
const Unauthorized = lazy(() => import('../pages/Unauthorized'));

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
  const { user, userProfile, isLoading, isFirstLogin } = useAuth();
  
  if (isLoading) {
    return <LoadingFallback />;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (isFirstLogin) {
    return <Navigate to="/change-password" />;
  }
  
  const roleFromMetadata = user.user_metadata?.role;
  const roleFromProfile = userProfile?.role;
  const userRole = roleFromMetadata || roleFromProfile;
  
  console.log('AdminRoute - checking role:', { roleFromMetadata, roleFromProfile, userRole });
  
  if (userRole !== 'admin') {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

const TeacherRoute = ({ children }) => {
  const { user, userProfile, isLoading, isFirstLogin } = useAuth();
  
  if (isLoading) {
    return <LoadingFallback />;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (isFirstLogin) {
    return <Navigate to="/change-password" />;
  }
  
  const roleFromMetadata = user.user_metadata?.role;
  const roleFromProfile = userProfile?.role;
  const userRole = roleFromMetadata || roleFromProfile;
  
  console.log('TeacherRoute - checking role:', { roleFromMetadata, roleFromProfile, userRole });
  
  if (userRole !== 'teacher') {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

const StudentRoute = ({ children }) => {
  const { user, userProfile, isLoading, isFirstLogin } = useAuth();
  
  if (isLoading) {
    return <LoadingFallback />;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (isFirstLogin) {
    return <Navigate to="/change-password" />;
  }
  
  const roleFromMetadata = user.user_metadata?.role;
  const roleFromProfile = userProfile?.role;
  const userRole = roleFromMetadata || roleFromProfile;
  
  console.log('StudentRoute - checking role:', { roleFromMetadata, roleFromProfile, userRole });
  
  if (userRole !== 'student') {
    return <Navigate to="/unauthorized" />;
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
        
        {/* Admin routes - /admin/* */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="subjects" element={<SubjectManagement />} />
          <Route path="classes" element={<ClassManagement />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="teachers" element={<TeacherManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        
        {/* Teacher routes - /teacher/* */}
        <Route path="/teacher" element={
          <TeacherRoute>
            <TeacherLayout />
          </TeacherRoute>
        }>
          <Route index element={<Navigate to="/teacher/dashboard" />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="classes" element={<TeacherClasses />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="tests" element={<TeacherTests />} />
          <Route path="grades" element={<TeacherGrades />} />
        </Route>
        
        {/* Student routes - /student/* */}
        <Route path="/student" element={
          <StudentRoute>
            <UserLayout />
          </StudentRoute>
        }>
          <Route index element={<Navigate to="/student/dashboard" />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="classes" element={<ClassRegistration />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="payments" element={<StudentPayments />} />
          <Route path="classes/:id" element={<ClassDetails />} />
        </Route>
        
        {/* Error pages */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Fallback routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
