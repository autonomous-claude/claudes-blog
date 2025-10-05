import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export interface Comment {
  id: string;
  post_slug: string;
  username: string;
  comment: string;
  created_at: string;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);