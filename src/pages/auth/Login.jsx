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
  const { signIn, user, userProfile, loading } = useAuth();
  const { showNotification } = useNotification();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Nếu đã đăng nhập, chuyển hướng dựa vào role
  useEffect(() => {
    if (user && !loading) {
      // Nếu chưa có userProfile và role không có trong metadata, chờ thêm
      if (!user.user_metadata?.role && !userProfile) {
        console.log('⏳ Waiting for userProfile to load...');
        return;
      }
      
      // Debug để xem role
      console.log('=== REDIRECT DEBUG ===');
      console.log('User:', user);
      console.log('User metadata:', user.user_metadata);
      console.log('UserProfile:', userProfile);
      
      // Kiểm tra role từ nhiều nguồn
      const roleFromMetadata = user.user_metadata?.role;
      const roleFromProfile = userProfile?.role;
      console.log('Role from metadata:', roleFromMetadata);
      console.log('Role from profile:', roleFromProfile);
      
      // Normalize role (chuyển về lowercase để so sánh)
      const role = (roleFromMetadata || roleFromProfile || 'student').toLowerCase();
      console.log('Final role (lowercase):', role);
      console.log('====================');
      
      // Thêm delay nhỏ để đảm bảo component đã mount
      setTimeout(() => {
        if (role === 'admin') {
          console.log('✅ Redirecting to ADMIN dashboard');
          navigate('/admin/dashboard', { replace: true });
        } else if (role === 'teacher') {
          console.log('✅ Redirecting to TEACHER dashboard');
          navigate('/teacher/dashboard', { replace: true });
        } else {
          console.log('✅ Redirecting to STUDENT dashboard');
          navigate('/student/dashboard', { replace: true });
        }
      }, 100);
    }
  }, [user, userProfile, loading, navigate]);
  
  // Nếu đang loading, hiển thị loading
  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  // Nếu đã đăng nhập nhưng chưa redirect, hiển thị loading
  if (user) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email hoặc số điện thoại là bắt buộc';
    } else {
      // Check if it's phone number
      const phoneRegex = /^(\+84|84|0)([3|5|7|8|9])+([0-9]{8})$/;
      const isPhone = phoneRegex.test(email.replace(/\s/g, ''));
      
      // If not phone, validate as email
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
      const result = await signIn(email, password);
      
      if (result.error) {
        throw result.error;
      }
      
      showNotification('Đăng nhập thành công!', 'success');
      
      // Redirect sẽ được handle tự động bởi useEffect khi user state thay đổi
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ 
        general: error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.' 
      });
      showNotification('Đăng nhập thất bại', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 3
    }}>
      <Container maxWidth="sm">
        <Paper sx={{
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <Box sx={{
            background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
            p: 4,
            textAlign: 'center',
            color: 'white',
            position: 'relative'
          }}>
            <Box sx={{ 
              position: 'absolute',
              top: -30,
              right: -30,
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.1)',
            }} />
            <Box sx={{ 
              position: 'absolute',
              bottom: -20,
              left: -20,
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.1)',
            }} />
            
            <SchoolIcon sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              🎓 Trung Tâm Luyện Thi
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              📚 Chào mừng bạn quay trở lại!
            </Typography>
          </Box>

          {/* Form */}
          <Box sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="bold" textAlign="center" mb={3} color="primary.main">
              🔐 Đăng nhập vào hệ thống
            </Typography>
            
            {errors.general && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {errors.general}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="📧 Email hoặc 📱 Số điện thoại"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email || "Nhập email hoặc số điện thoại của bạn"}
                    disabled={isSubmitting}
                    placeholder="example@email.com hoặc 0xxxxxxxxx"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.8)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.9)'
                        },
                        '&.Mui-focused': {
                          bgcolor: 'white'
                        }
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="🔒 Mật khẩu"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password}
                    disabled={isSubmitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                            disabled={isSubmitting}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.8)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.9)'
                        },
                        '&.Mui-focused': {
                          bgcolor: 'white'
                        }
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      boxShadow: '0 8px 16px rgba(102,126,234,0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 20px rgba(102,126,234,0.4)'
                      },
                      '&.Mui-disabled': {
                        background: 'linear-gradient(135deg, #ccc 0%, #999 100%)'
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <CircularProgress size={20} color="inherit" />
                        <span>🔄 Đang đăng nhập...</span>
                      </Box>
                    ) : (
                      '🚀 Đăng nhập'
                    )}
                  </Button>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Quên mật khẩu?
                </Typography>
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => navigate('/auth/forgot-password')}
                  sx={{
                    color: 'primary.main',
                    fontWeight: 'medium',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  🔑 Khôi phục mật khẩu
                </Link>
              </Box>
              
              <Box mt={3}>
                <Alert 
                  severity="info" 
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: 'rgba(33,150,243,0.1)',
                    border: '1px solid rgba(33,150,243,0.2)'
                  }}
                >
                  <Typography variant="body2" fontWeight="medium">
                    💡 <strong>Lưu ý:</strong> Tài khoản được cấp bởi quản trị viên. 
                    Nếu bạn chưa có tài khoản hoặc gặp vấn đề khi đăng nhập, 
                    vui lòng liên hệ với quản trị viên.
                  </Typography>
                </Alert>
              </Box>
            </form>
          </Box>
        </Paper>
        
        {/* Footer */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            © 2024 Trung Tâm Luyện Thi. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mt: 1, display: 'block' }}>
            🌟 Nơi ươm mầm tương lai 🌟
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Login;
