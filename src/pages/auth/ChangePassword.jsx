import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { verifyCurrentPassword, getSession } from '../../services/supabase/auth';

function ChangePassword() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmitCurrentPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const session = await getSession();
      const email = session.data.session.user.email; // Assuming getSession returns user object with email
  if (!email) {
    throw new Error('Không tìm thấy email trong token');
  }
      const { success, error } = await verifyCurrentPassword(email, currentPassword);

      if (!success) {
        setErrors({ currentPassword: 'Mật khẩu hiện tại không đúng' });
        setIsSubmitting(false);
        return;
      }

      setErrors({});
      setActiveStep(1); // Move to the next step
    } catch (err) {
      console.error('Error verifying current password:', err);
      setErrors({ currentPassword: 'Đã xảy ra lỗi, vui lòng thử lại' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitNewPassword = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call to update password
    setTimeout(() => {
      setIsSubmitting(false);
      setActiveStep(2); // Move to success step
    }, 2000);
  };

  const handleCancel = () => {
    // Logic để hủy và quay lại trang trước hoặc trang chủ
    window.location.href = '/'; // Redirect về trang chủ
};

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
          {activeStep === 0 && (
            <>
              <Typography component="h1" variant="h5" align="center">
                Xác nhận mật khẩu hiện tại
              </Typography>
              <Box component="form" noValidate onSubmit={handleSubmitCurrentPassword} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="currentPassword"
                  label="Mật khẩu hiện tại"
                  type={showPassword ? 'text' : 'password'}
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  error={!!errors.currentPassword}
                  helperText={errors.currentPassword}
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
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Xác nhận'}
                  </Button>
                </Box>
              </Box>
            </>
          )}

          {activeStep === 1 && (
            <>
              <Typography component="h1" variant="h5" align="center">
                Đổi mật khẩu
              </Typography>
              <Box component="form" noValidate onSubmit={handleSubmitNewPassword} sx={{ mt: 1 }}>
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
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Xác nhận mật khẩu mới"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
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
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Đổi mật khẩu'}
                  </Button>
                </Box>
              </Box>
            </>
          )}

          {activeStep === 2 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Đổi mật khẩu thành công!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Mật khẩu của bạn đã được cập nhật. Bạn sẽ được chuyển hướng đến trang chính trong vài giây...
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => (window.location.href = '/')}
                >
                  Về trang chủ
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default ChangePassword;