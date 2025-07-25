import { supabase } from './client';

// ----- STUDENTS -----
export const getStudents = async () => {
  const { data, error } = await supabase
    .from('students')
    .select('*, user_profiles(*)');
  
  return { data, error };
};

export const getStudentById = async (id) => {
  const { data, error } = await supabase
    .from('students')
    .select('*, user_profiles(*)')
    .eq('id', id)
    .single();
  
  return { data, error };
};

export const getStudentByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return { data, error };
};

export const getStudentByQrCode = async (qrCode) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('qr_code', qrCode)
    .single();
  
  return { data, error };
};

export const createStudent = async (studentData) => {
  const { data, error } = await supabase
    .from('students')
    .insert(studentData)
    .select();
  
  return { data, error };
};

export const updateStudent = async (id, studentData) => {
  const { data, error } = await supabase
    .from('students')
    .update(studentData)
    .eq('id', id)
    .select();
  
  return { data, error };
};

export const deleteStudent = async (id) => {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id);
  
  return { error };
};