import { supabase } from './client';
import { supabaseAdmin } from './adminClient';

// ----- USERS & PROFILES -----
export const getUserProfiles = async () => {
  // Use admin client to bypass RLS for admin operations
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select(`
      user_id,
      full_name,
      email,
      phone,
      role,
      created_at
    `)
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
  // Use admin client to bypass RLS
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .update(profileData)
    .eq('user_id', userId)
    .select();
  
  return { data, error };
};

// Helper function to check if string is phone number
const isPhoneNumber = (input) => {
  // Vietnamese phone number pattern
  const phoneRegex = /^(\+84|84|0)([3|5|7|8|9])+([0-9]{8})$/;
  return phoneRegex.test(input.replace(/\s/g, ''));
};

// Helper function to normalize phone number
const normalizePhone = (phone) => {
  // Remove spaces and convert to standard format
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

// Helper function to extract phone from email
const extractPhoneFromEmail = (email) => {
  if (email.endsWith('@phone.local')) {
    return email.replace('@phone.local', '');
  }
  return null;
};

export const createUser = async (phone, password, user_metadata, studentInfo) => {
  try {
    // Validate phone is provided
    if (!phone) {
      throw new Error('Số điện thoại là bắt buộc');
    }
    
    console.log('📥 createUser called with:', { phone, password: '***', user_metadata, studentInfo });
    
    // Normalize phone
    const actualPhone = normalizePhone(phone);
    
    // Create fake email from phone for Supabase auth
    const actualEmail = createEmailFromPhone(actualPhone);
    
    console.log('🚀 Creating user with data:', { 
      actualEmail, 
      actualPhone, 
      user_metadata
    });
    
    // 1. Create auth user with admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: actualEmail,
      password,
      email_confirm: true,
      user_metadata: {
        ...user_metadata,
        phone: actualPhone,
        is_phone_login: true // Always phone-based login
      }
    });

    if (authError) {
      console.error('❌ Auth error:', authError);
      throw authError;
    }
    
    console.log('✅ Auth user created:', authData.user.id);
    
    // 2. Create user profile with admin client (bypass RLS)
    const profileData = {
      user_id: authData.user.id,
      full_name: user_metadata.full_name,
      email: '', // No email, only phone
      phone: actualPhone,
      role: user_metadata.role
    };
    
    console.log('📝 Creating profile with data:', profileData);
    
    const { data: profileResult, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert(profileData)
      .select();
    
    if (profileError) {
      console.error('❌ Profile error:', profileError);
      console.error('📋 Profile error details:', {
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        code: profileError.code
      });
      throw profileError;
    }
    
    console.log('✅ Profile created:', profileResult);
    
    // 3. Auto-create records based on role
    if (user_metadata.role === 'student') {
      console.log('👨‍🎓 Creating student record...');
      // Create student record with additional info
      const studentData = {
        user_id: authData.user.id,
        full_name: user_metadata.full_name,
        email: '', // No email, only phone
        phone: actualPhone,
        date_of_birth: studentInfo?.date_of_birth || null,
        parent_name: studentInfo?.parent_name || null,
        parent_phone: studentInfo?.parent_phone || null,
        parent_zalo: studentInfo?.parent_zalo || null
      };
      
      const { error: studentError } = await supabaseAdmin
        .from('students')
        .insert(studentData);
      
      if (studentError) {
        console.error('❌ Student error:', studentError);
        throw studentError;
      }
      console.log('✅ Student record created');
    } else if (user_metadata.role === 'teacher') {
      console.log('👨‍🏫 Creating teacher record...');
      // Create teacher record
      const { error: teacherError } = await supabaseAdmin
        .from('teachers')
        .insert({
          user_id: authData.user.id,
          full_name: user_metadata.full_name,
          email: '', // No email, only phone
          phone: actualPhone
        });
      
      if (teacherError) {
        console.error('❌ Teacher error:', teacherError);
        throw teacherError;
      }
      console.log('✅ Teacher record created');
    }
    // For admin role, no additional table insert needed
    
    console.log('🎉 User creation completed successfully');
    return { data: authData.user, error: null };
  } catch (error) {
    console.error('💥 Error creating user:', error);
    return { data: null, error };
  }
};

export const deleteUser = async (userId) => {
  try {
    // 1. Get user profile to check role before deletion
    const { data: userProfile, error: profileFetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (profileFetchError) throw profileFetchError;
    
    // 2. Delete related records based on role
    if (userProfile?.role === 'student') {
      // Delete student record
      const { error: studentDeleteError } = await supabaseAdmin
        .from('students')
        .delete()
        .eq('user_id', userId);
      
      if (studentDeleteError) console.error('Error deleting student record:', studentDeleteError);
    } else if (userProfile?.role === 'teacher') {
      // Delete teacher record
      const { error: teacherDeleteError } = await supabaseAdmin
        .from('teachers')
        .delete()
        .eq('user_id', userId);
      
      if (teacherDeleteError) console.error('Error deleting teacher record:', teacherDeleteError);
    }
    
    // 3. Delete user profile with admin client (bypass RLS)
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);
    
    if (profileError) throw profileError;
    
    // 4. Delete auth user with admin client
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (authError) throw authError;
    
    return { error: null };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { error };
  }
};

export const resetUserPassword = async (userId, newPassword) => {
  // Use admin client to bypass RLS
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword
  });
  
  return { data, error };
};

export const updateFirstLogin = async (userId, firstLoginStatus) => {
  // Use admin client to bypass RLS for admin operations
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .update({ first_login: firstLoginStatus })
    .eq('user_id', userId)
    .select();

  return { data, error };
};

// Login with email or phone
export const loginWithEmailOrPhone = async (identifier, password) => {
  try {
    let email = identifier;
    
    // If identifier looks like phone number, convert to email format
    if (isPhoneNumber(identifier)) {
      email = createEmailFromPhone(identifier);
      console.log('📱 Phone login detected, using email:', email);
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { data, error };
  } catch (error) {
    console.error('Login error:', error);
    return { data: null, error };
  }
};

// Get display name for user (prioritize actual info over fake email)
export const getUserDisplayInfo = (user) => {
  if (!user) return {};
  
  const phone = extractPhoneFromEmail(user.email);
  const isPhoneAccount = !!phone;
  
  return {
    displayEmail: isPhoneAccount ? '' : user.email,
    displayPhone: phone || user.user_metadata?.phone || '',
    isPhoneAccount,
    primaryIdentifier: isPhoneAccount ? phone : user.email
  };
};