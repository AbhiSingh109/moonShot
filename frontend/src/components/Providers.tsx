"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
  const token = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
  if (token) {
    posthog.init(token, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: true,
    });
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const token = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";

  if (token) {
    return (
      <SessionProvider>
        <PostHogProvider client={posthog}>
          {children}
        </PostHogProvider>
      </SessionProvider>
    );
  }

  return <SessionProvider>{children}</SessionProvider>;
}

