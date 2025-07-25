import { Backdrop, CircularProgress, Box, Typography } from '@mui/material';

function Loading() {
  return (
    <Backdrop open={true} sx={{ zIndex: 9999, color: '#fff', flexDirection: 'column' }}>
      <CircularProgress color="inherit" size={60} />
      <Box mt={3}>
        <Typography variant="h6">Đang tải...</Typography>
      </Box>
    </Backdrop>
  );
}

export default Loading;
