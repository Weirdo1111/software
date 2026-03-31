"use client";

import Link from "next/link";
import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import type { Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

type AuthMode = "sign-in" | "sign-up";

const modeCopy = {
  "sign-in": {
    title: "Return to your learner workspace",
    button: "Sign in",
    statusReady: "Signed in. Your dashboard is ready.",
    helper: "Use the same account or email linked to your placement, progress tracking, and AI feedback.",
    altLabel: "Need a new account?",
    altHref: "/auth/sign-up",
    altCta: "Create one",
  },
  "sign-up": {
    title: "Create your learner account",
    button: "Create account",
    statusReady: "Account created. Continue to onboarding.",
    helper: "Your account stores placement results, daily plans, and reassessment history.",
    altLabel: "Already have an account?",
    altHref: "/auth/sign-in",
    altCta: "Sign in",
  },
} as const;

export function AuthForm({ mode, locale }: { mode: AuthMode; locale: Locale }) {
  const copy = modeCopy[mode];
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    if (!account || !password) {
      return false;
    }

    if (mode === "sign-up") {
      return password === confirmPassword && confirmPassword.length >= 8;
    }

    return true;
  }, [account, confirmPassword, mode, password]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");

    if (mode === "sign-up" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload =
        mode === "sign-in"
          ? { identifier: account, password }
          : { email: account, password };

      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      const user = data.user as { username?: string; email?: string } | undefined;
      const displayName = user?.username || user?.email || account.trim();
      localStorage.setItem("demo_logged_in", "true");
      localStorage.setItem("demo_user", displayName);
      window.dispatchEvent(new Event("demo-auth-changed"));
      setStatus(data.message || copy.statusReady);
      window.location.href = mode === "sign-up" ? "/dashboard" : "/dashboard";
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Authentication failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface-panel grid gap-5 rounded-[2rem] p-6 sm:p-7">
      <div>
        <p className="section-label">Account access</p>
        <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">{copy.title}</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{copy.helper}</p>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
          {mode === "sign-in" ? "Email / Account" : "Email"}
          <input
            name={mode === "sign-in" ? "identifier" : "email"}
            type={mode === "sign-in" ? "text" : "email"}
            value={account}
            onChange={(event) => setAccount(event.target.value)}
            placeholder={mode === "sign-in" ? "admin or you@university.edu" : "you@university.edu"}
            className="rounded-[1.1rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm outline-none transition focus:border-[var(--navy)] focus:ring-2 focus:ring-[rgba(20,50,75,0.08)]"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
          Password
          <input
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            className="rounded-[1.1rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm outline-none transition focus:border-[var(--navy)] focus:ring-2 focus:ring-[rgba(20,50,75,0.08)]"
          />
        </label>

        {mode === "sign-up" ? (
          <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
            Confirm password
            <input
              name="confirm_password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat your password"
              className={cn(
                "rounded-[1.1rem] border bg-white/75 px-4 py-3 text-sm outline-none transition focus:ring-2",
                confirmPassword && password !== confirmPassword
                  ? "border-[rgba(195,109,89,0.34)] focus:border-[var(--coral)] focus:ring-[rgba(195,109,89,0.08)]"
                  : "border-[rgba(20,50,75,0.16)] focus:border-[var(--navy)] focus:ring-[rgba(20,50,75,0.08)]",
              )}
            />
          </label>
        ) : null}
      </div>

      <div className="grid gap-3 rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.74)] p-4 text-sm text-[var(--ink-soft)]">
        <div className="flex items-center gap-3 text-[var(--ink)]">
          <ShieldCheck className="size-4" />
          <p className="font-semibold">What this unlocks</p>
        </div>
        <p>Placement history, dashboard metrics, AI feedback records, and your academic learning plan stay linked to this account.</p>
      </div>

      {error ? <p className="rounded-[1rem] bg-[rgba(255,244,240,0.9)] px-4 py-3 text-sm font-medium text-[var(--coral)]">{error}</p> : null}
      {status ? <p className="rounded-[1rem] bg-[rgba(237,246,241,0.9)] px-4 py-3 text-sm font-medium text-[var(--teal)]">{status}</p> : null}

      <button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        {isSubmitting ? "Working..." : copy.button}
      </button>

      <p className="text-sm text-[var(--ink-soft)]">
        {copy.altLabel}{" "}
        <Link href={`${copy.altHref}?lang=${locale}`} className="font-semibold text-[var(--navy)] hover:underline">
          {copy.altCta}
        </Link>
      </p>
    </form>
  );
}
