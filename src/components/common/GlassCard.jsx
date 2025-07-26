import { Card, CardContent, Typography, Box, Chip, IconButton, alpha } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

const GlassCard = ({ 
  children, 
  title, 
  subtitle, 
  action, 
  headerColor = '#667eea',
  ...props 
}) => {
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
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
        },
        ...props.sx
      }}
      {...props}
    >
      {(title || subtitle) && (
        <Box
          sx={{
            p: 3,
            pb: 1,
            background: `linear-gradient(135deg, ${headerColor}10, ${headerColor}05)`,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              {title && (
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: subtitle ? 0.5 : 0,
                    fontSize: '1.1rem'
                  }}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.85rem'
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            {action && (
              <Box>
                {action}
              </Box>
            )}
          </Box>
        </Box>
      )}
      
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        {children}
      </CardContent>
    </Card>
  );
};

export default GlassCard;
