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
        
        // Ngay lập tức set user nếu có session, load profile sau
        if (session?.user) {
          setAuthState({
            user: session.user,
            userProfile: null, // Load sau
            loading: false
          });
          
          // Load profile trong background
          refreshUserProfile(session.user.id);
        } else {
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

    // Timeout ngắn hơn (1 giây)
    timeoutId = setTimeout(() => {
      setAuthState(prev => ({ ...prev, loading: false }));
    }, 1000);

    getSession();

    // Lắng nghe thay đổi auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setAuthState({
          user: session.user,
          userProfile: null,
          loading: false
        });
        // Load profile sau
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
      subscription.unsubscribe();
    };
  }, [refreshUserProfile]);

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
