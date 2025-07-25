import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useAuth } from '../contexts/AuthContext';

function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goHome = () => {
    if (!user) {
      navigate('/');
    } else if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/user');
    }
  };

  return (
    <Container 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center'
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 100, color: 'error.main', mb: 4 }} />
      
      <Typography variant="h2" gutterBottom>
        404
      </Typography>
      
      <Typography variant="h4" gutterBottom>
        Trang không tồn tại
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </Typography>
      
      <Box mt={4}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={goHome}
        >
          Quay về Trang chủ
        </Button>
      </Box>
    </Container>
  );
}

export default NotFound;
