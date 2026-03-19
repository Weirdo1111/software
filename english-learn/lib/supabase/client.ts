import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";

export function createSupabaseBrowserClient() {
  if (!env.client.NEXT_PUBLIC_SUPABASE_URL || !env.client.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  return createBrowserClient(
    env.client.NEXT_PUBLIC_SUPABASE_URL,
    env.client.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
