import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';

function AuthLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', height: '100dvh', overflow: 'hidden', bgcolor: '#f5f9ff' }}>
      <Container
        component="main"
        maxWidth="md"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: { xs: 2, md: 3 },
          
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: { xs: 2.25, md: 3 },
            mx: 'auto',
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            backgroundColor: '#fff',
            maxWidth: { xs: '100%', sm: 560, md: 760 },
            border: '1px solid #e3eef7',
          }}
        >
          <Outlet />
        </Paper>
      </Container>
      
    </Box>
  );
}

export default AuthLayout;