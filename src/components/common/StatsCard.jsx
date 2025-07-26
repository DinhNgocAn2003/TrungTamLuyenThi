import { Card, CardContent, Typography, Box, IconButton, alpha } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'increase', 
  icon, 
  color = '#667eea',
  gradient
}) => {
  const cardGradient = gradient || `linear-gradient(135deg, ${color}40, ${color}60)`;
  
  return (
    <Card
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          '& .stats-icon': {
            transform: 'scale(1.1) rotate(5deg)',
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: cardGradient,
          borderRadius: '20px 20px 0 0'
        }
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative' }}>
        {/* Background Icon */}
        <Box
          sx={{
            position: 'absolute',
            top: -10,
            right: -10,
            width: 80,
            height: 80,
            background: cardGradient,
            borderRadius: '50%',
            opacity: 0.1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>

        {/* Content */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem'
              }}
            >
              {title}
            </Typography>
            <Box
              className="stats-icon"
              sx={{
                p: 1,
                borderRadius: '12px',
                background: cardGradient,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              {icon}
            </Box>
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: cardGradient,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 1,
              fontSize: { xs: '1.8rem', md: '2.2rem' }
            }}
          >
            {value}
          </Typography>

          {change && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {changeType === 'increase' ? (
                <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
              )}
              <Typography
                variant="body2"
                sx={{
                  color: changeType === 'increase' ? 'success.main' : 'error.main',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                {change}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.85rem',
                  ml: 0.5
                }}
              >
                so với tháng trước
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
