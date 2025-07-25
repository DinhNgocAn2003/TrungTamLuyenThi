import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  Link as MuiLink
} from '@mui/material';
import { Email as EmailIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase/client';
import { useNotification } from '../../contexts/NotificationContext';

function ForgotPassword() {
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Vui lòng nhập email của bạn');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setSuccess(true);
      showNotification('Đã gửi email khôi phục mật khẩu', 'success');
    } catch (error) {
      console.error('Error sending reset password email:', error);
      setError(error.message || 'Có lỗi xảy ra, vui lòng thử lại sau');
      showNotification('Lỗi khi gửi email khôi phục', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Typography component="h1" variant="h5" gutterBottom>
            Quên mật khẩu
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
          </Typography>
        </Box>
        
        {success ? (
          <Box my={3}>
            <Alert severity="success">
              <Typography variant="body1" gutterBottom>
                Một email khôi phục mật khẩu đã được gửi đến {email}.
              </Typography>
              <Typography variant="body2">
                Vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn để đặt lại mật khẩu của bạn.
                Nếu bạn không nhận được email, hãy kiểm tra thư mục spam.
              </Typography>
            </Alert>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
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
              {isSubmitting ? <CircularProgress size={24} /> : 'Gửi email khôi phục'}
            </Button>
          </Box>
        )}
        
        <Box mt={2} textAlign="center">
          <MuiLink component={Link} to="/login" variant="body2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
            Quay lại đăng nhập
          </MuiLink>
        </Box>
      </Paper>
    </Container>
  );
}

export default ForgotPassword;