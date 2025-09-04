import { supabase } from './client';
import { supabaseAdmin } from './adminClient';

// Phone validation used for transforming phone login into synthetic email in signInWithEmailOrPhone
// Accepted patterns: +84 / 84 / 0 followed by carrier prefix (3|5|7|8|9) and 8 digits
const isPhoneNumber = (input) => {
  if (!input) return false;
  const cleanedInput = input.replace(/\s|-/g, '');
  const phoneRegex = /^(\+84|84|0)[0-9]{9}$/;
  return phoneRegex.test(cleanedInput);
};

// Helper function to normalize phone number
const normalizePhone = (phone) => {
  let normalized = phone.replace(/\s/g, '');
  if (normalized.startsWith('+84')) {
    normalized = '0' + normalized.slice(3);
  } else if (normalized.startsWith('84')) {
    normalized = '0' + normalized.slice(2);
  }
  return normalized;
};

// Helper function to create email from phone
const createEmailFromPhone = (phone) => {
  const normalized = normalizePhone(phone);
  return `${normalized}@phone.local`;
};

// Đăng nhập bằng email hoặc số điện thoại
export const signInWithEmailOrPhone = async (identifier, password) => {
  try {
    let email = identifier;
    // Transform phone to synthetic email if detected
    if (isPhoneNumber(identifier)) {
      email = createEmailFromPhone(identifier);
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  } catch (error) {
    console.error('Auth sign-in error:', error.message || error);
    return { data: null, error };
  }
};

// Đăng nhập bằng email và mật khẩu (legacy function)
export const signInWithEmail = async (email, password) => {
  return signInWithEmailOrPhone(email, password);
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



// Lấy thông tin hồ sơ người dùng theo userId
export const getUserProfileById = async (userId) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id, role, full_name') // Chỉ lấy tối thiểu: user_id, role, full_name
    .eq('user_id', userId)
    .maybeSingle();
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
