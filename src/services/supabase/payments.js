import { supabase } from './client';
import { supabaseAdmin } from './adminClient';

// ----- PAYMENTS -----
export const getPayments = async (studentId = null) => {
  // Use admin client for admin operations to bypass RLS
  let query = supabaseAdmin
    .from('payments')
    .select('*, students(*), classes(*)');
  
  if (studentId) {
    query = query.eq('student_id', studentId);
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const createPayment = async (paymentData) => {
  // Use admin client to bypass RLS
  const { data, error } = await supabaseAdmin
    .from('payments')
    .insert(paymentData)
    .select();
  
  return { data, error };
};

export const updatePayment = async (id, paymentData) => {
  // Use admin client to bypass RLS
  const { data, error } = await supabaseAdmin
    .from('payments')
    .update(paymentData)
    .eq('id', id)
    .select();
  
  return { data, error };
};