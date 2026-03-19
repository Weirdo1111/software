import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

export async function createSupabaseServerClient() {
  if (!env.server.SUPABASE_URL || !env.server.SUPABASE_ANON_KEY) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.server.SUPABASE_URL, env.server.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

export function createSupabaseServiceClient() {
  if (!env.server.SUPABASE_URL || !env.server.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createClient(env.server.SUPABASE_URL, env.server.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
