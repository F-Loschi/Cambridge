import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client: bypasses RLS. Server-only — never import from
// client components or expose SUPABASE_SERVICE_ROLE_KEY to the browser.
// Used for batch question generation/audit jobs that need to write
// across the whole question_bank regardless of ownership.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
