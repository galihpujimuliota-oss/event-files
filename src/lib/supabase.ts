/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Clean up user inputs just in case they added quotes, spaces, or /rest/v1
const supabaseUrl = rawUrl.replace(/['"]/g, '').trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = rawKey.replace(/['"]/g, '').trim();

export const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;
