import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useNavigate, Navigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

function Login() {
  const navigate = useNavigate();
  const { login, user, isLoading } = useAuth();
  const { showNotification } = useNotification();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Nếu đã đăng nhập, chuyển hướng dựa vào role
  useEffect(() => {
    if (user) {
      const role = user.user_metadata?.role || 'student';
      if (role === 'admin' || role === 'teacher') {
        navigate('/admin');
      } else {
        navigate('/user/dashboard');
      }
    }
  }, [user, navigate]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Vui lòng nhập email hoặc tên đăng nhập';
    }
    
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Xử lý trường hợp người dùng nhập username thay vì email
      const loginEmail = email.includes('@') ? email : `${email}@example.com`;
      
      const { error } = await login(loginEmail, password);
      
      if (error) {
        if (error.message.includes('Invalid login')) {
          showNotification('Tên đăng nhập hoặc mật khẩu không đúng', 'error');
        } else {
          showNotification(`Lỗi đăng nhập: ${error.message}`, 'error');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      showNotification(`Lỗi đăng nhập: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Nếu đã đăng nhập, chuyển hướng dựa vào role
  if (user && !isLoading) {
    const role = user.user_metadata?.role || 'student';
    return <Navigate to={role === 'admin' || role === 'teacher' ? '/admin' : '/user/'} />;
  }
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <SchoolIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
            <Typography component="h1" variant="h4">
              Đăng nhập
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chào mừng đến với hệ thống quản lý lớp học
            </Typography>
          </Box>
          
          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email hoặc tên đăng nhập"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Đăng nhập'}
            </Button>
            
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/forgot-password" variant="body2">
                  Quên mật khẩu?
                </Link>
              </Grid>
            </Grid>
            
            <Box mt={3}>
              <Alert severity="info">
                Lưu ý: Tài khoản được cấp bởi quản trị viên. Nếu bạn chưa có tài khoản hoặc gặp vấn đề khi đăng nhập, vui lòng liên hệ với quản trị viên.
              </Alert>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;
