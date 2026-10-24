import "server-only";
import { createClient } from "@supabase/supabase-js";

// Full-access client (bypasses RLS). Server-side use only, and only after
// checking the signed-in user is allowed to do the action.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in .env.local");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
