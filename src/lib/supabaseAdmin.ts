import { createClient } from '@supabase/supabase-js';

/**
 * Supabase admin client (service role) — SERVER ONLY.
 * Dipakai API routes & crawler buat baca/tulis data perumahan.
 * Jangan pernah import file ini dari komponen client.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return null; // belum dikonfigurasi — caller wajib handle fallback
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export const SUPABASE_CONFIGURED = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
