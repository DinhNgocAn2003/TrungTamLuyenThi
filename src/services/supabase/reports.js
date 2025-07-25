import { supabase } from './client';

export const getUnpaidStudents = async () => {
  const { data, error } = await supabase
    .rpc('get_unpaid_students');
  
  return { data, error };
};

export const getAbsentStudents = async (minAbsences = 3) => {
  const { data, error } = await supabase
    .rpc('get_absent_students', { min_absences: minAbsences });
  
  return { data, error };
};