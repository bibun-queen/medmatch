import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { CONFIG } from '../config.js?v=20260817-1';

const supabaseUrl = String(CONFIG.supabaseUrl || '')
  .trim()
  .replace(/\/+$/, '');

const supabaseKey = String(CONFIG.supabasePublishableKey || '').trim();

export const configured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseKey) &&
  !supabaseUrl.includes('YOUR_PROJECT') &&
  !supabaseKey.includes('REPLACE_ME');

console.log('MedMatch Supabase config:', {
  url: supabaseUrl,
  keyType: supabaseKey.startsWith('sb_publishable_')
    ? 'publishable'
    : 'other',
  configured
});

export const supabase = configured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
