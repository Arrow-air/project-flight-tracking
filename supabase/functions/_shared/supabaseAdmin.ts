import { createClient } from "npm:@supabase/supabase-js@^2.58.0";
import type { SupabaseClient } from "npm:@supabase/supabase-js@^2.58.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseApiKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseApiKey) {
  throw new Error("Supabase environment variables misconfigured");
}

export const supabaseAdmin: SupabaseClient = createClient(
    supabaseUrl, 
    supabaseApiKey
);
