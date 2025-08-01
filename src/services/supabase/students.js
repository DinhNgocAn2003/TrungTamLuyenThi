import { supabase } from './client';
import { supabaseAdmin } from './adminClient';

// ----- STUDENTS -----
export const getStudents = async () => {
  // Use admin client for admin operations to bypass RLS
  const { data, error } = await supabaseAdmin
    .from('students')
    .select(`
      *,
      user_profiles(*)
    `);
  
  return { data, error };
};

export const getStudentById = async (id) => {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      user_profiles(*)
    `)
    .eq('user_id', id)
    .maybeSingle(); // Sử dụng maybeSingle() thay vì single()
  
  return { data, error };
};

export const getStudentByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      user_profiles(*)
    `)
    .eq('user_id', userId)
    .maybeSingle(); // Sử dụng maybeSingle() thay vì single()
  
  return { data, error };
};

// Function này sẽ được sử dụng cho điểm danh bằng user_id
// getStudentByUserId đã có sẵn ở trên

export const createStudent = async (studentData) => {
  // Use admin client to bypass RLS
  const { data, error } = await supabaseAdmin
    .from('students')
    .insert(studentData)
    .select(`
      *,
      user_profiles(*)
    `);
  
  return { data, error };
};

export const updateStudent = async (id, studentData) => {
  // Use admin client to bypass RLS  
  const { data, error } = await supabaseAdmin
    .from('students')
    .update(studentData)
    .eq('user_id', id)
    .select(`
      *,
      user_profiles(*)
    `);
  
  return { data, error };
};

export const deleteStudent = async (id) => {
  // Use admin client to bypass RLS
  const { error } = await supabaseAdmin
    .from('students')
    .delete()
    .eq('user_id', id);
  
  return { error };
};