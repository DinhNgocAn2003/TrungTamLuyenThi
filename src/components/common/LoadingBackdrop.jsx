import { Backdrop, CircularProgress } from '@mui/material';
import { useLoading } from '../../contexts/LoadingContext';

function LoadingBackdrop() {
  const { isLoading } = useLoading();

  return (
    <Backdrop
      sx={{ 
        color: '#fff', 
        zIndex: (theme) => theme.zIndex.drawer + 2,
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
      }}
      open={isLoading}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}

export default LoadingBackdrop;
