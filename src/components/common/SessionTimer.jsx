import { useState, useEffect } from 'react';
import { Box, Chip, Tooltip, IconButton } from '@mui/material';
import { AccessTime as AccessTimeIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase/client';

const SessionTimer = () => {
  const { sessionInfo, user } = useAuth();
  const [timeLeft, setTimeLeft] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!sessionInfo || !user) {
      setTimeLeft('');
      return;
    }

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = sessionInfo.expiresAt - now;
      
      if (timeUntilExpiry <= 0) {
        setTimeLeft('Hết hạn');
        return;
      }

      const hours = Math.floor(timeUntilExpiry / 3600);
      const minutes = Math.floor((timeUntilExpiry % 3600) / 60);
      const seconds = timeUntilExpiry % 60;

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [sessionInfo, user]);

  const handleRefreshToken = async () => {
    try {
      setRefreshing(true);
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Failed to refresh token:', error);
      } else {
        console.log('Token refreshed successfully');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (!user || !sessionInfo) {
    return null;
  }

  const timeUntilExpiry = sessionInfo.expiresAt - Math.floor(Date.now() / 1000);
  const isExpiringSoon = timeUntilExpiry <= 300; // 5 minutes
  const isExpired = timeUntilExpiry <= 0;

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Tooltip title={`Phiên hết hạn lúc: ${sessionInfo.expiresAtFormatted}`}>
        <Chip
          icon={<AccessTimeIcon />}
          label={timeLeft}
          size="small"
          color={isExpired ? 'error' : isExpiringSoon ? 'warning' : 'success'}
          variant="outlined"
        />
      </Tooltip>
      
      <Tooltip title="Gia hạn phiên">
        <IconButton
          size="small"
          onClick={handleRefreshToken}
          disabled={refreshing}
          sx={{ ml: 0.5 }}
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default SessionTimer;
