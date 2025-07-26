import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Avatar
} from '@mui/material';
import {
  Block as BlockIcon,
  Home as HomeIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

function Unauthorized() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoHome = () => {
    const role = user?.user_metadata?.role;
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'teacher') {
      navigate('/user/teacher/dashboard');
    } else if (role === 'student') {
      navigate('/user/student/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
          overflow: 'hidden',
          textAlign: 'center',
          p: 4
        }}>
          {/* Header */}
          <Box sx={{
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
            p: 3,
            m: -4,
            mb: 3,
            color: 'white',
            position: 'relative'
          }}>
            <Box sx={{ 
              position: 'absolute',
              top: -20,
              right: -20,
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.1)',
            }} />
            
            <Box 
              component="img"
              src={logo}
              alt="Logo"
              sx={{ 
                height: 50,
                width: 'auto',
                mb: 2,
                borderRadius: 1
              }}
            />
            <SchoolIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              🚫 Không có quyền truy cập
            </Typography>
          </Box>

          {/* Content */}
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 3,
              bgcolor: 'error.main'
            }}
          >
            <BlockIcon sx={{ fontSize: 40 }} />
          </Avatar>

          <Typography variant="h5" fontWeight="bold" color="error.main" gutterBottom>
            Truy cập bị từ chối
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Bạn không có quyền truy cập vào trang này. Vui lòng kiểm tra lại vai trò của bạn 
            hoặc liên hệ với quản trị viên để được hỗ trợ.
          </Typography>

          {user && (
            <Box sx={{ 
              bgcolor: 'grey.100', 
              p: 2, 
              borderRadius: 2, 
              mb: 3,
              textAlign: 'left'
            }}>
              <Typography variant="subtitle2" color="text.secondary">
                Thông tin tài khoản:
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {user.email}
              </Typography>
              <Typography variant="body2">
                <strong>Vai trò:</strong> {user.user_metadata?.role || 'Chưa xác định'}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textTransform: 'none',
                px: 3
              }}
            >
              Về trang chủ
            </Button>

            <Button
              variant="outlined"
              onClick={handleLogout}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                px: 3
              }}
            >
              Đăng xuất
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
            Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ với quản trị viên hệ thống.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default Unauthorized;
