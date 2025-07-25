import { supabase } from './client';

// Đăng nhập bằng email và mật khẩu
export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
};

// Đăng xuất
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Lấy thông tin người dùng hiện tại
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { data, error };
};

// Lấy session hiện tại
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
};

// Đặt lại mật khẩu
export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { data, error };
};

// Cập nhật mật khẩu
export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
};

// Kiểm tra nếu là lần đăng nhập đầu tiên
export const checkFirstLogin = async (userId) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('first_login')
    .eq('user_id', userId)
    .single();
  
  if (error) return { data: null, error };
  return { data, error: null };
};

// Cập nhật trạng thái lần đăng nhập đầu tiên
export const updateFirstLogin = async (userId, value) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ first_login: value })
    .eq('user_id', userId);
  
  return { data, error };
};

// Lấy thông tin hồ sơ người dùng theo userId
export const getUserProfileById = async (userId) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return { data, error };
};

// Xác minh mật khẩu hiện tại
export const verifyCurrentPassword = async (email, currentPassword) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (error) return { success: false, error };
  return { success: true, data };
};
