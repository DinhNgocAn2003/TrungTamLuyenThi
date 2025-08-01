// Utility functions for token management
import { supabase } from '../services/supabase/client';

export const getTokenExpirationInfo = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return { isLoggedIn: false };
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = session.expires_at;
  const timeUntilExpiry = expiresAt - now;

  return {
    isLoggedIn: true,
    expiresAt: new Date(expiresAt * 1000),
    timeUntilExpiry,
    isExpired: timeUntilExpiry <= 0,
    expiresInMinutes: Math.floor(timeUntilExpiry / 60),
    willExpireSoon: timeUntilExpiry <= 300 // 5 phút
  };
};

export const forceTokenRefresh = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    
    console.log('✅ Token refreshed successfully');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Failed to refresh token:', error);
    return { success: false, error };
  }
};

// Helper để hiển thị thời gian còn lại
export const formatTimeUntilExpiry = (seconds) => {
  if (seconds <= 0) return 'Đã hết hạn';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};
