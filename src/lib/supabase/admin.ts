import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client: bypasses RLS. Only for server code that has already checked permissions.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
