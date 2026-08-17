import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { CONFIG } from '../config.js';

export const configured = /^https:\/\/.+\.supabase\.co$/.test(CONFIG.supabaseUrl) && CONFIG.supabasePublishableKey.startsWith('sb_publishable_') && !CONFIG.supabasePublishableKey.includes('REPLACE_ME');
export const supabase = configured ? createClient(CONFIG.supabaseUrl, CONFIG.supabasePublishableKey, {
  auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true }
}) : null;
