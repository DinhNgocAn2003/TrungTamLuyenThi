import { supabase } from './client';
import { supabaseAdmin } from './adminClient';

// ----- STUDENTS -----
export const getStudents = async () => {
  // Use admin client for admin operations to bypass RLS
  const { data, error } = await supabaseAdmin
    .from('students')
    .select('*, user_profiles(*)');
  
  return { data, error };
};

export const getStudentById = async (id) => {
  const { data, error } = await supabase
    .from('students')
    .select('*, user_profiles(*)')
    .eq('id', id)
    .maybeSingle(); // Sử dụng maybeSingle() thay vì single()
  
  return { data, error };
};

export const getStudentByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle(); // Sử dụng maybeSingle() thay vì single()
  
  return { data, error };
};

export const getStudentByQrCode = async (qrCode) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('qr_code', qrCode)
    .maybeSingle(); // Sử dụng maybeSingle() thay vì single()
  
  return { data, error };
};

export const createStudent = async (studentData) => {
  // Use admin client to bypass RLS
  const { data, error } = await supabaseAdmin
    .from('students')
    .insert(studentData)
    .select();
  
  return { data, error };
};

export const updateStudent = async (id, studentData) => {
  // Use admin client to bypass RLS  
  const { data, error } = await supabaseAdmin
    .from('students')
    .update(studentData)
    .eq('id', id)
    .select();
  
  return { data, error };
};

export const deleteStudent = async (id) => {
  // Use admin client to bypass RLS
  const { error } = await supabaseAdmin
    .from('students')
    .delete()
    .eq('id', id);
  
  return { error };
};