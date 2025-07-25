import { supabase } from './client';

// ----- PAYMENTS -----
export const getPayments = async (studentId = null) => {
  let query = supabase
    .from('payments')
    .select('*, students(*), classes(*)');
  
  if (studentId) {
    query = query.eq('student_id', studentId);
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const createPayment = async (paymentData) => {
  const { data, error } = await supabase
    .from('payments')
    .insert(paymentData)
    .select();
  
  return { data, error };
};

export const updatePayment = async (id, paymentData) => {
  const { data, error } = await supabase
    .from('payments')
    .update(paymentData)
    .eq('id', id)
    .select();
  
  return { data, error };
};