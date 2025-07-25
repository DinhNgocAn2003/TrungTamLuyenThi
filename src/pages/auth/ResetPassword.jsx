import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Link,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { updatePassword } from '../../services/supabase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, firstLogin, updateFirstLoginStatus } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    // Nếu không phải lần đăng nhập đầu tiên và đang không đặt lại mật khẩu, 
    // chuyển hướng người dùng về trang chủ
    if (user && !firstLogin && !window.location.hash.includes('type=recovery')) {
      navigate(user.role === 'admin' ? '/admin' : '/user');
    }
  }, [user, firstLogin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      showNotification('Mật khẩu không khớp', 'error');
      return;
    }
    
    if (password.length < 6) {
      showNotification('Mật khẩu phải có ít nhất 6 ký tự', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await updatePassword(password);
      
      if (error) throw error;
      
      if (firstLogin) {
        await updateFirstLoginStatus(false);
      }
      
      showNotification('Cập nhật mật khẩu thành công', 'success');
      
      // Chuyển hướng người dùng về trang chủ
      setTimeout(() => {
        navigate(user?.role === 'admin' ? '/admin' : '/user');
      }, 1500);
    } catch (error) {
      console.error('Password reset error:', error);
      showNotification('Lỗi: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Typography component="h1" variant="h5" align="center" gutterBottom>
        {firstLogin ? 'Đổi mật khẩu lần đầu' : 'Đặt lại mật khẩu'}
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 3 }}>
        {firstLogin 
          ? 'Vui lòng đổi mật khẩu để tiếp tục sử dụng hệ thống.' 
          : 'Nhập mật khẩu mới cho tài khoản của bạn.'}
      </Typography>
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Mật khẩu mới"
        type={showPassword ? 'text' : 'password'}
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Xác nhận mật khẩu"
        type={showPassword ? 'text' : 'password'}
        id="confirmPassword"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
      </Button>
      
      {!firstLogin && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link component={RouterLink} to="/" variant="body2">
            Quay lại đăng nhập
          </Link>
        </Box>
      )}
    </Box>
  );
}

export default ResetPassword;
