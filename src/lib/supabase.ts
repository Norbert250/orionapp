import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

// Check if we have valid Supabase credentials
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

let hasValidCredentials = supabaseUrl &&
  supabaseKey &&
  isValidUrl(supabaseUrl) &&
  supabaseUrl !== 'your_supabase_project_url' &&
  supabaseKey !== 'your_supabase_anon_key'

if (!hasValidCredentials) {
  console.warn('⚠️ Supabase credentials not configured.')
  console.warn('To enable Supabase functionality, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file')
  console.warn('App will continue with limited functionality.')
}

// Create Supabase client with fallback for invalid credentials
let supabaseClient: any;

if (hasValidCredentials) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    hasValidCredentials = false;
  }
}

if (!hasValidCredentials) {
  console.warn('⚠️ Using fallback Supabase client - functionality will be limited');
  // Create a minimal fallback client
  supabaseClient = {
    from: () => ({
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      select: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
    }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
      })
    },
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } })
    }
  };
}

export const supabase = supabaseClient;