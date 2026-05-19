import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local.");
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Bypass navigator.locks. The default coordinator can deadlock when the
    // auth client is instantiated more than once in the same tab (React
    // StrictMode dev double-mount, HMR), wedging every subsequent request.
    lock: (_name, _acquireTimeout, fn) => fn(),
  },
});
