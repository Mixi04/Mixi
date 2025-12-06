import { createClient } from '@supabase/supabase-js';

// Using the credentials provided by the user
const supabaseUrl = 'https://plxlihjkiceqgygsseqg.supabase.co';
const supabaseKey = 'sb_publishable_oStgJt8x3RTh_wcyqEi_8g_k7mjIR6C'; // Public/Anon Key

export const supabase = createClient(supabaseUrl, supabaseKey);