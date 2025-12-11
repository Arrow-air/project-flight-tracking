import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

let supabase: SupabaseClient;
try {
  supabase = createClient(supabaseUrl, supabasePublishableKey);
} catch (error) {
  console.error('Error creating Supabase client:', error);
  console.error('Supabase URL:', supabaseUrl);
  console.error('Supabase Publishable Key:', supabasePublishableKey);
  throw error;
}

export { supabase };
