
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env as any).SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = (process.env as any).SUPABASE_ANON_KEY || 'placeholder_key';

export const isSupabaseConfigured = () => {
  return !supabaseUrl.includes('placeholder') && supabaseAnonKey !== 'placeholder_key';
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
