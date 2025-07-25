import { supabase } from './client';

// ----- USERS & PROFILES -----
export const getUserProfiles = async () => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const getUserProfileById = async (userId) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return { data, error };
};

export const updateUserProfile = async (userId, profileData) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(profileData)
    .eq('user_id', userId)
    .select();
  
  return { data, error };
};

export const createUser = async ({ email, password, user_metadata, student_id }) => {
  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata
    });

    if (authError) throw authError;
    
    // 2. Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        user_id: authData.user.id,
        full_name: user_metadata.full_name,
        email: email,
        role: user_metadata.role,
        first_login: true
      });
    
    if (profileError) throw profileError;
    
    // 3. Update student record if applicable
    if (student_id) {
      const { error: studentError } = await supabase
        .from('students')
        .update({ user_id: authData.user.id })
        .eq('id', student_id);
      
      if (studentError) throw studentError;
    }
    
    return { data: authData.user, error: null };
  } catch (error) {
    console.error('Error creating user:', error);
    return { data: null, error };
  }
};

export const deleteUser = async (userId) => {
  // 1. Delete user profile
  const { error: profileError } = await supabase
    .from('user_profiles')
    .delete()
    .eq('id', userId);
  
  if (profileError) return { error: profileError };
  
  // 2. Delete auth user
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  
  return { error: authError };
};

export const resetUserPassword = async (userId, newPassword) => {
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword
  });
  
  return { data, error };
};

export const updateFirstLogin = async (userId, firstLoginStatus) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ first_login: firstLoginStatus })
    .eq('user_id', userId)
    .select();

  return { data, error };
};