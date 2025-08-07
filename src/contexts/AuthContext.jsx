import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase/client';
import { getUserProfileById, signInWithEmailOrPhone } from '../services/supabase/auth';

const AuthContext = createContext({
  user: null,
  userProfile: null,
  loading: true,
  signIn: () => {},
  signOut: () => {},
  signUp: () => {},
  refreshUserProfile: () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    userProfile: null,
    loading: true
  });

  const refreshUserProfile = useCallback(async (userId) => {
    if (!userId) return null;
    try {
      const { data: profile, error } = await getUserProfileById(userId);
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      setAuthState(prev => ({
        ...prev,
        userProfile: profile
      }));
      return profile;
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      return null;
    }
  }, []);

  // Sign out function
  const signOut = async () => {
    try {
      // Clear auto logout timer
      if (window.autoLogoutTimer) {
        clearTimeout(window.autoLogoutTimer);
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setAuthState({
        user: null,
        userProfile: null,
        loading: false
      });
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  };

  // Auto logout function
  const autoLogout = useCallback(async () => {
    await signOut();
    // Redirect to login page
    window.location.href = '/login';
  }, []);

  // Setup auto logout timer
  const setupAutoLogout = useCallback((expiresAt) => {
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = (expiresAt - now) * 1000; // Convert to milliseconds
    
    // Clear any existing timeout
    if (window.autoLogoutTimer) {
      clearTimeout(window.autoLogoutTimer);
    }
    
    if (timeUntilExpiry > 0) {
      window.autoLogoutTimer = setTimeout(autoLogout, timeUntilExpiry);
    }
  }, [autoLogout]);

  useEffect(() => {
    let timeoutId;
    
    // Lấy session hiện tại
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          
          setAuthState({
            user: session.user,
            userProfile: null,
            loading: false
          });
          
          // Setup auto logout
          setupAutoLogout(session.expires_at);
          
          // Load profile trong background
          refreshUserProfile(session.user.id);
        } else {
          console.log('❌ No session found');
          setAuthState({
            user: null,
            userProfile: null,
            loading: false
          });
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    // Timeout để tránh loading lâu
    timeoutId = setTimeout(() => {
      setAuthState(prev => ({ ...prev, loading: false }));
    }, 1000);

    getSession();

    // Lắng nghe thay đổi auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed successfully');
        if (session) {
          // Reset auto logout timer
          setupAutoLogout(session.expires_at);
        }
      } else if (event === 'SIGNED_OUT' || event === 'TOKEN_EXPIRED') {
        console.log('🚪 User signed out or token expired');
        setAuthState({
          user: null,
          userProfile: null,
          loading: false
        });
        
        // Clear auto logout timer
        if (window.autoLogoutTimer) {
          clearTimeout(window.autoLogoutTimer);
        }
        
        return;
      }
      
      if (session?.user) {
        setAuthState({
          user: session.user,
          userProfile: null,
          loading: false
        });
        
        // Setup auto logout
        setupAutoLogout(session.expires_at);
        
        // Load profile trong background
        refreshUserProfile(session.user.id);
      } else {
        setAuthState({
          user: null,
          userProfile: null,
          loading: false
        });
      }
    });

    return () => {
      clearTimeout(timeoutId);
      if (window.autoLogoutTimer) {
        clearTimeout(window.autoLogoutTimer);
      }
      subscription.unsubscribe();
    };
  }, [refreshUserProfile, setupAutoLogout, autoLogout]);

  const signIn = async (emailOrPhone, password) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await signInWithEmailOrPhone(emailOrPhone, password);
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false }));
        return { data: null, error };
      }
      
      // onAuthStateChange sẽ handle việc set user
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      return { data: null, error };
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      return { data: null, error };
    }
  };

  const value = {
    user: authState.user,
    userProfile: authState.userProfile,
    loading: authState.loading,
    signIn,
    signOut,
    logout: signOut, // Alias for backward compatibility
    signUp,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
