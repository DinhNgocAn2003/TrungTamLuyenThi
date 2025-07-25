import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase/client';
import { getUserProfileById, checkFirstLogin, updateFirstLogin } from '../services/supabase/auth';

const AuthContext = createContext({
  user: null,
  userProfile: null,
  firstLogin: false,
  loading: true,
  login: async () => ({ success: false, error: null }),
  logout: async () => ({ success: false, error: null }),
  resetPassword: async () => ({ success: false, error: null }),
  updatePassword: async () => ({ success: false, error: null }),
  updateFirstLoginStatus: async () => ({ success: false, error: null }),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    userProfile: null,
    firstLogin: false,
    loading: true,
  });

  // Hàm chung để cập nhật state
  const updateAuthState = (updates) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  };

  // Xử lý session khi auth state thay đổi
  const handleAuthChange = useCallback(async (event, session) => {
    try {
      if (session?.user) {
        const [{ data: profile }, { data: firstLoginData }] = await Promise.all([
          getUserProfileById(session.user.id),
          checkFirstLogin(session.user.id)
        ]);

        updateAuthState({
          user: session.user,
          userProfile: profile,
          firstLogin: firstLoginData?.first_login || false,
          loading: false
        });
      } else {
        updateAuthState({
          user: null,
          userProfile: null,
          firstLogin: false,
          loading: false
        });
      }
    } catch (error) {
      console.error('Auth state change error:', error);
      updateAuthState({ loading: false });
    }
  }, []);

  // Theo dõi thay đổi auth state
useEffect(() => {
  // console.log("AuthProvider mounted - Setting up auth listener");
  
  // Lấy session ngay lập tức khi component mount
  supabase.auth.getSession()
    .then(({ data: { session }, error }) => {
      // console.log("Initial session check:", { session, error });
      if (error) {
        console.error("Error getting initial session:", error);
        return;
      }
      handleAuthChange('INITIAL_SESSION', session);
    })
    .catch((err) => {
      console.error("Failed to get initial session:", err);
    });

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      // console.log(`Auth state changed: ${event}`, session);
      handleAuthChange(event, session);
    }
  );

  return () => {
    // console.log("AuthProvider unmounted - Cleaning up auth listener");
    subscription?.unsubscribe();
  };
}, [handleAuthChange]);

const login = async (email, password) => {
  updateAuthState({ loading: true });
  
  try {
    
    const result = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
     
    const { data, error } = result;
    
    if (error) {
      console.error("Login error details:", {
        message: error.message,
        status: error.status,
        name: error.name
      });
      throw error;
    }
    
    if (!data?.user) {
      throw new Error("No user data returned");
    }
    
    console.log("Login successful, user:", data.user);
    return { success: true, user: data.user };
    
  } catch (error) {
    console.error("Full login error:", {
      message: error.message,
      stack: error.stack,
      originalError: error
    });
    
    // Xử lý các loại lỗi cụ thể
    let errorMessage = error.message;
    if (error.status === 400) {
      errorMessage = "Email hoặc mật khẩu không đúng";
    }
    
    return { 
      success: false, 
      error: errorMessage,
      details: error 
    };
  } finally {
    console.log("Login attempt completed");
    updateAuthState({ loading: false });
  }
};

  const logout = async () => {
    updateAuthState({ loading: true });
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    } finally {
      updateAuthState({ loading: false });
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateFirstLoginStatus = async (value) => {
    if (!authState.user) return { success: false, error: 'User not authenticated' };
    
    try {
      const { error } = await updateFirstLogin(authState.user.id, value);
      if (error) throw error;
      
      updateAuthState({ firstLogin: value });
      return { success: true };
    } catch (error) {
      console.error('Update first login error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    ...authState,
    login,
    logout,
    resetPassword,
    updatePassword,
    updateFirstLoginStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};