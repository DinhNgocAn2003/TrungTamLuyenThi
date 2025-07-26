import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography, Link } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import logo from '../assets/logo.png';

function AuthLayout() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e88e5 0%, #1976d2 50%, #1565c0 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }
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
          justifyContent: 'center',
          zIndex: 1
        }}
      >
        {/* Header Section */}
        <Box sx={{ 
          mb: 6, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center',
              mb: 3
            }}
          >
            <Box 
              component="img"
              src={logo}
              alt="Logo"
              sx={{ 
                height: 60,
                width: 'auto',
                mb: 2,
                borderRadius: 2,
                filter: 'drop-shadow(0 4px 20px rgba(255,255,255,0.3))'
              }}
            />
            <SchoolIcon 
              sx={{ 
                fontSize: 50, 
                mb: 2,
                color: '#fff',
                filter: 'drop-shadow(0 4px 20px rgba(255,255,255,0.3))'
              }} 
            />
            <Typography 
              component="h1" 
              variant="h3" 
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(45deg, #fff, #f0f0f0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                mb: 1,
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              TRUNG TÂM LUYỆN THI
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 400,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              Nơi ươm mầm tương lai ✨
            </Typography>
          </Paper>
          
          <Typography 
            variant="body1" 
            align="center" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: 400,
              lineHeight: 1.6
            }}
          >
            Nền tảng quản lý giáo dục hiện đại với công nghệ tiên tiến và giao diện thân thiện
          </Typography>
        </Box>
        
        {/* Auth Form Container */}
        <Paper
          elevation={24}
          sx={{
            p: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '25px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 60px rgba(31, 38, 135, 0.37)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #1e88e5, #2196f3, #4caf50, #ff9800)',
              borderRadius: '25px 25px 0 0'
            }
          }}
        >
          <Outlet />
        </Paper>
      </Container>
      
      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 1
        }}
      >
        <Container maxWidth="sm">
          <Typography 
            variant="body2" 
            align="center"
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 500
            }}
          >
            {'Copyright © '}
            <Link 
              color="inherit" 
              href="#"
              sx={{ 
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Trung Tâm Luyện Thi
            </Link>{' '}
            {new Date().getFullYear()}
            {'. Made with ❤️ by Education Team'}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default AuthLayout;