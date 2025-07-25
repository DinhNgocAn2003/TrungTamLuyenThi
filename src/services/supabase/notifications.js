import { supabase } from './client';

export const getNotifications = async (studentId = null) => {
  let query = supabase
    .from('notifications')
    .select('*, students(*)')
    .order('created_at', { ascending: false });
  
  if (studentId) {
    query = query.eq('student_id', studentId);
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const sendNotification = async (studentId, type, message) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      student_id: studentId,
      type,
      message,
      sent: new Date().toISOString()
    })
    .select();
  
  return { data, error };
};

export const sendZaloNotification = async (studentId, type, message) => {
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('parent_name, parent_zalo')
    .eq('id', studentId)
    .single();
  
  if (studentError) return { error: studentError };
  if (!student.parent_zalo) return { error: { message: 'No parent Zalo number' } };
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        student_id: studentId,
        type,
        message,
        sent: new Date().toISOString(),
        zalo_status: 'pending'
      })
      .select();
    
    if (error) throw error;
    
    // In a real app, call Zalo API here
    const notificationId = data[0].id;
    await supabase
      .from('notifications')
      .update({ zalo_status: 'sent' })
      .eq('id', notificationId);
    
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error sending Zalo notification:', error);
    return { error };
  }
};