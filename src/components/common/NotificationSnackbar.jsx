import { Snackbar, Alert } from '@mui/material';
import { useNotification } from '../../contexts/NotificationContext';

function NotificationSnackbar() {
  const { notification, hideNotification } = useNotification();

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    hideNotification();
  };

  return (
    <Snackbar
      open={!!notification}
      autoHideDuration={notification?.duration || 5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      {notification && (
        <Alert 
          onClose={handleClose} 
          severity={notification.severity || 'info'} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      )}
    </Snackbar>
  );
}

export default NotificationSnackbar;
