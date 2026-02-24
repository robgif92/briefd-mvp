import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn('Supabase credentials missing. Database operations will fail.');
}

// We use the service role key because the webhook needs to bypass RLS 
// to write user data securely from the backend.
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
