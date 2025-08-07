import { createClient } from '@supabase/supabase-js';

// Environment variables will be loaded from .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Kiểm tra biến môi trường
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Thiếu biến môi trường Supabase. Vui lòng kiểm tra file .env');
  throw new Error('Missing Supabase environment variables');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'implicit'
  },
  global: {
    headers: {
      'x-application-name': 'TrungTamLuyenThi'
    }
  }
});