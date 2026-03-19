import { PostHog } from "posthog-node";

import { env } from "@/lib/env";

let client: PostHog | null = null;

export function getPostHogClient() {
  if (client) {
    return client;
  }

  if (!env.server.NEXT_PUBLIC_POSTHOG_KEY) {
    return null;
  }

  client = new PostHog(env.server.NEXT_PUBLIC_POSTHOG_KEY, {
    host: env.server.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });

  return client;
}
