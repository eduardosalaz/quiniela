import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local.");
}

// In-process lock: serializes calls with the same name within this tab.
// Replaces the default navigator.locks coordinator (which can deadlock when
// the auth client is re-instantiated in the same tab — StrictMode, HMR) AND
// the no-op we previously used (which let concurrent token refreshes race
// each other, invalidating refresh tokens and wedging the client on first
// load).
const _lockChain = new Map();
function inProcessLock(name, _acquireTimeout, fn) {
  const prev = _lockChain.get(name) || Promise.resolve();
  const next = prev.then(fn, fn);
  _lockChain.set(name, next.catch(() => {}));
  return next;
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    lock: inProcessLock,
  },
});
