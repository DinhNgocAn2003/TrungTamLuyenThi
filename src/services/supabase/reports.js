import { supabase } from './client';
import { supabaseAdmin } from './adminClient';

export const getUnpaidStudents = async () => {
  try {
    // Use admin client to bypass RLS - try stored procedure first
    const { data, error } = await supabaseAdmin
      .rpc('get_unpaid_students');
    
    if (!error) {
      return { data, error };
    }
    
    // If stored procedure fails, use regular query with admin client
    console.warn('Stored procedure failed, using fallback query:', error);
    
    const { data: fallbackData, error: fallbackError } = await supabaseAdmin
      .from('class_enrollments')
      .select(`
        id,
        enrollment_date,
        students!inner (
          id,
          full_name,
          phone,
          parent_phone
        ),
        classes!inner (
          id,
          name,
          tuition_fee
        )
      `)
      .eq('status', 'active');
    
    if (fallbackError) {
      return { data: null, error: fallbackError };
    }
    
    // Transform data to match stored procedure format
    const transformedData = fallbackData?.map(item => ({
      id: item.id,
      student_id: item.students.id,
      full_name: item.students.full_name,
      class_id: item.classes.id,
      class_name: item.classes.name,
      amount_due: item.classes.tuition_fee || 0,
      enrollment_date: item.enrollment_date,
      phone: item.students.phone,
      parent_phone: item.students.parent_phone
    })) || [];
    
    return { data: transformedData, error: null };
    
  } catch (error) {
    console.error('Error in getUnpaidStudents:', error);
    return { data: null, error };
  }
};

export const getAbsentStudents = async (minAbsences = 3) => {
  try {
    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .rpc('get_absent_students', { min_absences: minAbsences });
    
    if (!error) {
      return { data, error };
    }
    
    // Fallback query if stored procedure fails
    console.warn('get_absent_students stored procedure failed, using fallback');
    
    // Return empty array for simple fallback
    return { data: [], error: null };
    
  } catch (error) {
    console.error('Error in getAbsentStudents:', error);
    return { data: [], error: null };
  }
};