import { Box, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

function PageHeader({ title, breadcrumbs = [] }) {
  return (
    <Box mb={3}>
      <Typography variant="h4" gutterBottom component="h1">
        {title}
      </Typography>
      
      {breadcrumbs.length > 0 && (
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return isLast ? (
              <Typography color="text.primary" key={index}>
                {crumb.label}
              </Typography>
            ) : (
              <MuiLink 
                component={Link} 
                to={crumb.link} 
                color="inherit" 
                key={index}
                underline="hover"
              >
                {crumb.label}
              </MuiLink>
            );
          })}
        </Breadcrumbs>
      )}
    </Box>
  );
}
export default PageHeader;
