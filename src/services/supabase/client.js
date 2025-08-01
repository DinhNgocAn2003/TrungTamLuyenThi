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
    // Token sẽ hết hạn sau 1 giờ (3600 giây)
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Thời gian token hết hạn (tính bằng giây)
    // 3600 = 1 giờ, 1800 = 30 phút, 900 = 15 phút
    flowType: 'implicit'
  }
});