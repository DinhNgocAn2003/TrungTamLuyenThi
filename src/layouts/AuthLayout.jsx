import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography, Link } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';

function AuthLayout() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Container 
        component="main" 
        maxWidth="sm" 
        sx={{ 
          mb: 4, 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center' 
        }}
      >
        <Box sx={{ 
          mb: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}>
          <SchoolIcon color="primary" sx={{ fontSize: 60, mb: 1 }} />
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Hệ thống quản lý lớp học
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary">
            Nền tảng quản lý lớp học trực tuyến hiệu quả
          </Typography>
        </Box>
        
        <Outlet />
      </Container>
      
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="#">
              Hệ thống quản lý lớp học
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default AuthLayout;