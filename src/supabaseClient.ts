import { createClient } from '@supabase/supabase-js';

// Supabase credentials provided by user
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://xwfaeaarnvagypmfpyam.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_DyNLGbNDOkTZrD4beNzoNw_i1_qpfyf';


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
