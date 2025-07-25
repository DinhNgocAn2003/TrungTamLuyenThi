import { supabase } from './client';
import dayjs from 'dayjs';

// ----- ATTENDANCE -----
export const getAttendance = async (classId, date = null) => {
  let query = supabase
    .from('attendance')
    .select('*, students(*), classes(*)')
    .eq('class_id', classId);
  
  if (date) {
    query = query.eq('date', date);
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const getAttendanceByDate = async (classId, date) => {
  const formattedDate = dayjs(date).format('YYYY-MM-DD');
  
  const { data, error } = await supabase
    .from('attendance')
    .select('*, students(*)')
    .eq('class_id', classId)
    .eq('date', formattedDate);
  
  return { data, error };
};

export const markAttendance = async (attendanceData) => {
  const { data, error } = await supabase
    .from('attendance')
    .insert(attendanceData)
    .select();
  
  return { data, error };
};

export const updateAttendance = async (id, attendanceData) => {
  const { data, error } = await supabase
    .from('attendance')
    .update(attendanceData)
    .eq('id', id)
    .select();
  
  return { data, error };
};