import React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { NavigateNext } from '@mui/icons-material';

const PageHeader = ({ 
  title, 
  subtitle, 
  breadcrumbs = [], 
  action, 
  gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  ...props 
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        background: gradient,
        borderRadius: 4,
        p: 4,
        mb: 4,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -50,
          right: -50,
          width: 100,
          height: 100,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 60,
          height: 60,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          animation: 'float 4s ease-in-out infinite reverse',
        },
        '@keyframes float': {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
        ...props.sx
      }}
      {...props}
    >
      {/* Decorative background elements */}
      <Box sx={{
        position: 'absolute',
        top: 20,
        right: 20,
        width: 80,
        height: 80,
        borderRadius: '50%',
        bgcolor: 'rgba(255,255,255,0.1)',
        animation: 'pulse 3s ease-in-out infinite',
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 0.5,
            transform: 'scale(1)',
          },
          '50%': {
            opacity: 0.8,
            transform: 'scale(1.1)',
          },
        },
      }} />

      <Box sx={{ position: 'relative', zIndex: 2 }}>
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />}
            sx={{
              mb: 2,
              '& .MuiBreadcrumbs-ol': {
                alignItems: 'center'
              }
            }}
          >
            {breadcrumbs.map((crumb, index) => (
              <Link
                key={index}
                component={crumb.link ? RouterLink : 'span'}
                to={crumb.link}
                sx={{
                  color: index === breadcrumbs.length - 1 ? 'white' : 'rgba(255,255,255,0.8)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: index === breadcrumbs.length - 1 ? 600 : 400,
                  '&:hover': {
                    color: 'white',
                    textDecoration: crumb.link ? 'underline' : 'none'
                  }
                }}
              >
                {crumb.label}
              </Link>
            ))}
          </Breadcrumbs>
        )}

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          flexWrap="wrap"
          gap={2}
        >
          <Box flex={1}>
            {/* Title */}
            <Typography 
              variant="h3" 
              component="h1"
              fontWeight="bold" 
              gutterBottom 
              sx={{ 
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                lineHeight: 1.2,
                mb: subtitle ? 1 : 0
              }}
            >
              {title}
            </Typography>

            {/* Subtitle */}
            {subtitle && (
              <Typography 
                variant="h6" 
                sx={{ 
                  opacity: 0.9,
                  fontWeight: 400,
                  lineHeight: 1.4
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {/* Action section */}
          {action && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                minWidth: 'fit-content'
              }}
            >
              {action}
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default PageHeader;
