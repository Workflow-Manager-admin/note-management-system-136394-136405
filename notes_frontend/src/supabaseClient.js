import { createClient } from '@supabase/supabase-js';

// PUBLIC_INTERFACE
// Initializes and exports a Supabase client instance using environment variables.
// Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY are set in your .env file.

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
