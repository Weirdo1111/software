"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

export function AnalyticsProvider() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) {
      return;
    }

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: true,
    });
  }, []);

  return null;
}
