import { Button, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';

const GradientButton = styled(Button)(({ theme, gradient = 'linear-gradient(135deg, #5c9bd5 0%, #70a288 100%)' }) => ({
  background: gradient,
  borderRadius: '15px',
  border: 'none',
  color: '#fff',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.95rem',
  padding: '12px 24px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.1)',
    opacity: 0,
    transition: 'opacity 0.3s ease'
  },
  
  '&:hover': {
    transform: 'translateY(-1px)', // Less movement
    boxShadow: '0 6px 20px rgba(0,0,0,0.12)', // Softer shadow
    
    '&::before': {
      opacity: 1
    }
  },
  
  '&:active': {
    transform: 'translateY(0px)',
  },
  
  '&.MuiButton-sizeLarge': {
    padding: '15px 30px',
    fontSize: '1rem'
  },
  
  '&.MuiButton-sizeSmall': {
    padding: '8px 16px',
    fontSize: '0.85rem'
  }
}));

const GlassButton = styled(Button)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '15px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: '#fff',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.95rem',
  padding: '12px 24px',
  transition: 'all 0.3s ease',
  
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-1px)', // Less movement
    boxShadow: '0 6px 20px rgba(0,0,0,0.12)', // Softer shadow
  },
  
  '&:active': {
    transform: 'translateY(0px)',
  }
}));

const OutlineButton = styled(Button)(({ theme, color = '#5c9bd5' }) => ({
  background: 'transparent',
  borderRadius: '15px',
  border: `2px solid ${color}`,
  color: color,
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.95rem',
  padding: '10px 24px',
  transition: 'all 0.3s ease',
  
  '&:hover': {
    background: color,
    color: '#fff',
    transform: 'translateY(-1px)', // Less movement
    boxShadow: `0 6px 20px ${alpha(color, 0.25)}`, // Softer shadow
  },
  
  '&:active': {
    transform: 'translateY(0px)',
  }
}));

export { GradientButton, GlassButton, OutlineButton };
