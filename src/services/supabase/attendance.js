import { supabase } from './client';
import { supabaseAdmin } from './adminClient';
import dayjs from 'dayjs';

// ----- ATTENDANCE -----
export const getAttendance = async (classId = null, studentId = null, date = null) => {
  // Use admin client for admin operations to bypass RLS
  let query = supabaseAdmin
    .from('attendance')
    .select('*, students(*), classes(*)');
  
  if (classId) {
    query = query.eq('class_id', classId);
  }
  
  if (studentId) {
    query = query.eq('student_id', studentId);
  }
  
  if (date) {
    query = query.eq('date', date);
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const getAttendanceByDate = async (classId, date) => {
  const formattedDate = dayjs(date).format('YYYY-MM-DD');
  
  // Use admin client to bypass RLS
  const { data, error } = await supabaseAdmin
    .from('attendance')
    .select('*, students(*)')
    .eq('class_id', classId)
    .eq('date', formattedDate);
  
  return { data, error };
};

export const markAttendance = async (attendanceData) => {
  // Use admin client to bypass RLS for admin/teacher operations
  const { data, error } = await supabaseAdmin
    .from('attendance')
    .insert(attendanceData)
    .select();
  
  return { data, error };
};

export const updateAttendance = async (id, attendanceData) => {
  // Use admin client to bypass RLS
  const { data, error } = await supabaseAdmin
    .from('attendance')
    .update(attendanceData)
    .eq('id', id)
    .select();
  
  return { data, error };
};