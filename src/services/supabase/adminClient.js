import { createClient } from '@supabase/supabase-js';

// Environment variables will be loaded from .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

// Debug environment variables
// console.log('🔧 Admin Client Debug:');
// console.log('URL:', supabaseUrl);
// console.log('Anon Key exists:', !!supabaseAnonKey);
// console.log('Service Key exists:', !!supabaseServiceKey);
// console.log('Service Key length:', supabaseServiceKey?.length);

// Use service key for admin operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Regular client for normal operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
