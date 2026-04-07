import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

import { createSessionCookieOptions, shouldUseSecureAuthCookies } from "@/lib/auth-session";

const env = process.env as Record<string, string | undefined>;
const originalNodeEnv = process.env.NODE_ENV;
const originalCookieOverride = process.env.AUTH_COOKIE_SECURE;

describe("auth session cookie options", () => {
  afterEach(() => {
    env.NODE_ENV = originalNodeEnv;

    if (originalCookieOverride === undefined) {
      delete env.AUTH_COOKIE_SECURE;
      return;
    }

    env.AUTH_COOKIE_SECURE = originalCookieOverride;
  });

  it("keeps auth cookies non-secure for HTTP requests in production", () => {
    env.NODE_ENV = "production";
    delete env.AUTH_COOKIE_SECURE;

    const options = createSessionCookieOptions(
      new Date("2026-04-07T00:00:00.000Z"),
      new Request("http://localhost/api/auth/sign-in"),
    );

    expect(options.secure).toBe(false);
  });

  it("marks auth cookies secure for HTTPS requests", () => {
    env.NODE_ENV = "production";
    delete env.AUTH_COOKIE_SECURE;

    const options = createSessionCookieOptions(
      new Date("2026-04-07T00:00:00.000Z"),
      new Request("https://localhost/api/auth/sign-in"),
    );

    expect(options.secure).toBe(true);
  });

  it("honors forwarded HTTPS requests behind a reverse proxy", () => {
    env.NODE_ENV = "production";
    delete env.AUTH_COOKIE_SECURE;

    const headers = new Headers({
      "x-forwarded-proto": "https",
    });

    expect(shouldUseSecureAuthCookies(headers)).toBe(true);
  });

  it("lets AUTH_COOKIE_SECURE override the detected protocol", () => {
    env.NODE_ENV = "production";
    env.AUTH_COOKIE_SECURE = "false";

    expect(shouldUseSecureAuthCookies(new Request("https://localhost/api/auth/sign-in"))).toBe(false);

    env.AUTH_COOKIE_SECURE = "true";

    expect(shouldUseSecureAuthCookies(new Request("http://localhost/api/auth/sign-in"))).toBe(true);
  });
});
