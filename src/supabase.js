import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key. Check your environment variables.')
  throw new Error('Missing Supabase configuration')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)