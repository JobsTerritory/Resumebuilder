import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Soft fail if keys are missing to allow local-only mode
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Falling back to local storage.');
}

// Export null if not configured, or a dummy client? 
// Better to export the client if valid, or null.
// But typescript expects a SupabaseClient. 
// Let's rely on the service to check.
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
