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
      if (error) throw error;
      
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

  useEffect(() => {
    let timeoutId;
    
    // Lấy session hiện tại
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          console.log('🔍 Session found, setting user immediately...');
          // Set user ngay lập tức để login nhanh
          setAuthState({
            user: session.user,
            userProfile: null,
            loading: false
          });
          
          // Load profile trong background (không block UI)
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

    // Timeout rất ngắn (300ms) để tránh loading lâu
    timeoutId = setTimeout(() => {
      setAuthState(prev => ({ ...prev, loading: false }));
    }, 300);

    getSession();

    // Lắng nghe thay đổi auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // console.log('🔐 Auth state changed:', event, session?.user?.id);
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed successfully');
      } else if (event === 'SIGNED_OUT' || event === 'TOKEN_EXPIRED') {
        console.log('🚪 User signed out or token expired');
        setAuthState({
          user: null,
          userProfile: null,
          loading: false
        });
        // Redirect to login if token expired
        if (event === 'TOKEN_EXPIRED') {
          window.location.href = '/login';
        }
        return;
      }
      
      if (session?.user) {
        // Check token expiration
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = session.expires_at;
        
        if (expiresAt && now >= expiresAt) {
          console.log('⏰ Token expired, signing out...');
          await signOut();
          return;
        }
        
        console.log('👤 Setting user immediately, loading profile in background...');
        // Set user ngay lập tức
        setAuthState({
          user: session.user,
          userProfile: null,
          loading: false
        });
        
        // Load profile trong background
        refreshUserProfile(session.user.id);
      } else {
        console.log('❌ No session in auth state change');
        setAuthState({
          user: null,
          userProfile: null,
          loading: false
        });
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [refreshUserProfile]);

  // Check token expiration định kỳ (mỗi 5 phút)
  useEffect(() => {
    const checkTokenExpiration = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = session.expires_at;
        
        // Nếu token sắp hết hạn trong 5 phút tới
        if (expiresAt && (expiresAt - now) <= 300) {
          console.log('⚠️ Token sắp hết hạn, đang refresh...');
          const { error } = await supabase.auth.refreshSession();
          if (error) {
            console.error('❌ Không thể refresh token:', error);
            await signOut();
          }
        }
      }
    };

    // Check ngay lập tức
    checkTokenExpiration();
    
    // Check mỗi 5 phút
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const signIn = async (emailOrPhone, password) => {
    try {
      const { data, error } = await signInWithEmailOrPhone(emailOrPhone, password);
      
      if (error) {
        return { data: null, error };
      }
      
      // Không cần set loading vì onAuthStateChange sẽ handle
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
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

  const signOut = async () => {
    try {
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
