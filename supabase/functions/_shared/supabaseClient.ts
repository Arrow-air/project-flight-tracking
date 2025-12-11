import {createClient, SupabaseClient} from "supabase";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseApiKey = Deno.env.get("SUPABASE_ANON_KEY");

if (!supabaseUrl || !supabaseApiKey) 
{
  throw new Error("Supabase environment variables misconfigured");
}

let anonSupabase : SupabaseClient;
try {
  anonSupabase = createClient(supabaseUrl, supabaseApiKey);
} catch (error) {
  console.error('Failed to create Supabase client');
  console.error('Supabase URL:', supabaseUrl);
  console.error('Supabase Key:', supabaseApiKey); 
  throw error;
}

export function createAuthClient(authorizationHeader : string) 
{
  const supabaseClient : SupabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    // Create client with Auth context of the user that called the function.
    // This way your row-level-security (RLS) policies are applied.
    {
      global: {
        headers: {Authorization: authorizationHeader},
      },
    }
  );
  return supabaseClient;

  //...
}
