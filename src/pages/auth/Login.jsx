import { useState, useEffect } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Grid, Link, InputAdornment, IconButton, Alert, CircularProgress, Divider } from '@mui/material';
import { Email as EmailIcon, Lock as LockIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import logo from '../../assets/logo.png';
import { useNavigate, Navigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { signInWithEmailOrPhone } from '../../services/supabase/auth';

function Login() {
  const navigate = useNavigate();
  const { signIn, user, userProfile, loading } = useAuth();
  const { showNotification } = useNotification();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect ngay khi có user: ưu tiên userProfile.role, fallback metadata role
  useEffect(() => {
    if (loading || !user) return;
    const profileRole = userProfile?.role?.toLowerCase();
    const metaRole = user?.user_metadata?.role?.toLowerCase();
    const effectiveRole = profileRole || metaRole;
    if (!effectiveRole) return; // chưa có role -> chờ thêm
    let target = '/login';
    if (effectiveRole === 'admin') target = '/admin/dashboard';
    else if (effectiveRole === 'teacher') target = '/teacher/dashboard';
    else if (effectiveRole === 'student') target = '/student/dashboard';
    else {
      showNotification('Vai trò không hợp lệ. Liên hệ quản trị.', 'error');
      return;
    }
    // Nếu đã ở đúng path thì thôi
    if (window.location.pathname !== target) {
      navigate(target, { replace: true });
    }
  }, [user, userProfile, loading, navigate, showNotification]);
  
  // Loading chỉ khi auth context đang xử lý session ban đầu
  if (loading) {
    return (
      <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f9ff' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email hoặc số điện thoại là bắt buộc';
    } else {
      // Same rule as services/supabase/auth.js (isPhoneNumber)
      const phoneRegex = /^(\+84|84|0)[0-9]{9}$/;
      const isPhone = phoneRegex.test(email.replace(/\s|-/g, ''));
      // If not phone, must be valid email
      if (!isPhone && !/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Email không hợp lệ hoặc số điện thoại không đúng định dạng';
      }
    }
    
    if (!password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const result = await signInWithEmailOrPhone(email, password);
      
      if (result.error) {
  // Silent fail except user feedback
        
        // Handle specific error types
        let errorMessage = 'Đăng nhập thất bại';
        
        if (result.error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Email/số điện thoại hoặc mật khẩu không đúng';
        } else if (result.error.message?.includes('Email not confirmed')) {
          errorMessage = 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email';
        } else if (result.error.message?.includes('Too many requests')) {
          errorMessage = 'Quá nhiều lần thử. Vui lòng thử lại sau';
        } else if (result.error.message?.includes('Network')) {
          errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet';
        } else {
          errorMessage = result.error.message || 'Có lỗi xảy ra khi đăng nhập';
        }
        
        showNotification(errorMessage, 'error');
        setErrors({ 
          general: errorMessage 
        });
  } else {
        showNotification('Đăng nhập thành công!', 'success');
        // Navigation will be handled by useEffect
      }
    } catch (error) {
      const errorMessage = 'Có lỗi không mong muốn xảy ra. Vui lòng thử lại';
      showNotification(errorMessage, 'error');
      setErrors({ 
        general: errorMessage 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

return (
  <Box sx={{ 
    minHeight: '100dvh', 
    bgcolor: '#dbe7f6', 
    display: 'flex', 
    alignItems: 'center',
    py: { xs: 2, md: 4 }
  }}>
      <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2 } }}>
        <Paper elevation={3} sx={{ 
            borderRadius: { xs: 3, md: 4 }, 
            overflow: 'hidden',
            mx: { xs: 1, sm: 2 },
        }}>
          <Grid container sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Branding Panel */}
            <Grid item md={5} sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 1,
              p: { xs: 3, md: 4 },
              background: 'linear-gradient(145deg,#1976d2 0%,#42a5f5 60%,#90caf9 100%)',
              color: 'white',
              minHeight: 'auto'
            }}>
              <Box textAlign="center" sx={{ 
                  mb: { xs: 0, md: 4 },
                  gap: 0.5, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  minHeight: { xs: 'auto', md: '15vh' }
                }}>
                <Box component="img" src={logo} alt="Logo" sx={{ 
                    width: { xs: 40, md: 50 }, 
                    height: { xs: 40, md: 50 } 
                }} />
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                  Trung Tâm Luyện Thi DNA
                </Typography>
              </Box>
            </Grid>
            
            {/* Form Panel */}
            <Grid item xs={12} md={7} sx={{ 
                p: { xs: 3, sm: 4, md: 6 }, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center' 
            }}>
              <Box maxWidth={380} mx="auto" width="100%">
                <Typography variant="h5" fontWeight={600} mb={1} sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
                  Đăng nhập
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3} sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                  Nhập thông tin để tiếp tục
                </Typography>
                {errors.general && <Alert severity="error" sx={{ mb: 2, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>{errors.general}</Alert>}
                <form onSubmit={handleSubmit} noValidate>
                  <TextField
                    fullWidth
                    label="Email hoặc Số điện thoại"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!errors.email}
                    disabled={isSubmitting}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start"><EmailIcon fontSize="small" /></InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        height: { xs: 48, md: 56 }
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Mật khẩu"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password}
                    disabled={isSubmitting}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleTogglePasswordVisibility} edge="end" size="small" disabled={isSubmitting}>
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        height: { xs: 48, md: 56 }
                      }
                    }}
                  />
                  <Button type="submit" fullWidth variant="contained" disabled={isSubmitting} sx={{ 
                      mt: 2, 
                      mb: 1, 
                      py: { xs: 1, md: 1.2 },
                      fontSize: { xs: '0.9rem', md: '1rem' }
                    }}>
                    {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Đăng nhập'}
                  </Button>
                  <Box textAlign="right" mb={2}>
                    <Link component="button" variant="body2" onClick={() => navigate('/auth/forgot-password')} sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                      Quên mật khẩu?
                    </Link>
                  </Box>
                  <Alert severity="info" sx={{ 
                      fontSize: { xs: 11, md: 12 }, 
                      py: { xs: 0.5, md: 0.5 }, 
                      mb: 0,
                      '& .MuiAlert-message': {
                        padding: { xs: '4px 0', md: '6px 0' }
                      }
                    }}>
                    Tài khoản do quản trị viên cấp. Nếu chưa có tài khoản hãy liên hệ quản trị.
                  </Alert>
                </form>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
