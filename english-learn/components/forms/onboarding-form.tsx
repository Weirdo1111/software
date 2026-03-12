"use client";

import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

const goalOptions = [
  {
    value: "coursework",
    title: "Coursework support",
    detail: "Build stronger academic reading and writing for assignments, tutorials, and short papers.",
  },
  {
    value: "research",
    title: "Research reading",
    detail: "Improve abstract reading, evidence tracking, and vocabulary needed for source-based study.",
  },
  {
    value: "seminar",
    title: "Seminar speaking",
    detail: "Train discussion turns, pronunciation clarity, and short academic presentation responses.",
  },
] as const;

const minuteOptions = [20, 35, 50] as const;

const nativeLanguageOptions = [
  { value: "zh", label: "Chinese" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "ja", label: "Japanese" },
] as const;

export function OnboardingForm() {
  const [goal, setGoal] = useState<(typeof goalOptions)[number]["value"]>("coursework");
  const [dailyMinutes, setDailyMinutes] = useState<(typeof minuteOptions)[number]>(35);
  const [nativeLanguage, setNativeLanguage] = useState("zh");
  const [uiLanguage, setUiLanguage] = useState("zh");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const currentGoal = useMemo(() => goalOptions.find((option) => option.value === goal) ?? goalOptions[0], [goal]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus("");
    setError("");

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          daily_minutes: dailyMinutes,
          native_language: nativeLanguage,
          ui_language: uiLanguage,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save onboarding profile.");
      }

      setStatus("Profile saved. Your first academic study plan has been prepared.");
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Failed to save onboarding profile.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface-panel grid gap-6 rounded-[2rem] p-6 sm:p-7">
      <div>
        <p className="section-label">Learner setup</p>
        <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">Define the kind of academic support this learner needs first.</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
          This profile shapes the daily plan, which skill gets more emphasis, and how the platform should interpret progress after placement.
        </p>
      </div>

      <section className="grid gap-3">
        <p className="text-sm font-semibold text-[var(--ink)]">Primary objective</p>
        <div className="grid gap-3 md:grid-cols-3">
          {goalOptions.map((option) => {
            const selected = option.value === goal;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setGoal(option.value)}
                className={cn(
                  "rounded-[1.4rem] border p-4 text-left transition",
                  selected
                    ? "border-[rgba(20,50,75,0.24)] bg-[rgba(20,50,75,0.08)] shadow-[0_12px_24px_rgba(20,50,75,0.06)]"
                    : "border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.72)] hover:bg-[rgba(20,50,75,0.05)]",
                )}
              >
                <p className="text-sm font-semibold text-[var(--ink)]">{option.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{option.detail}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3">
        <p className="text-sm font-semibold text-[var(--ink)]">Daily study budget</p>
        <div className="flex flex-wrap gap-3">
          {minuteOptions.map((minutes) => (
            <button
              key={minutes}
              type="button"
              onClick={() => setDailyMinutes(minutes)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition",
                dailyMinutes === minutes
                  ? "border-[var(--navy)] bg-[var(--navy)] text-[#f7efe3]"
                  : "border-[rgba(20,50,75,0.16)] bg-white/72 text-[var(--ink)] hover:bg-[rgba(20,50,75,0.08)]",
              )}
            >
              {minutes} min / day
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
          Native language
          <select
            value={nativeLanguage}
            onChange={(event) => setNativeLanguage(event.target.value)}
            className="rounded-[1.1rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm outline-none"
          >
            {nativeLanguageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
          Interface language
          <select
            value={uiLanguage}
            onChange={(event) => setUiLanguage(event.target.value)}
            className="rounded-[1.1rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm outline-none"
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>

      <div className="rounded-[1.5rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.72)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Plan preview</p>
        <h3 className="font-display mt-3 text-2xl tracking-tight text-[var(--ink)]">{currentGoal.title}</h3>
        <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{currentGoal.detail}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.2rem] bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Daily load</p>
            <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{dailyMinutes} minutes</p>
          </div>
          <div className="rounded-[1.2rem] bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Band logic</p>
            <p className="mt-2 text-lg font-semibold text-[var(--ink)]">Assessment-led</p>
          </div>
          <div className="rounded-[1.2rem] bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Primary outcome</p>
            <p className="mt-2 text-lg font-semibold text-[var(--ink)]">Academic fluency</p>
          </div>
        </div>
      </div>

      {error ? <p className="rounded-[1rem] bg-[rgba(255,244,240,0.9)] px-4 py-3 text-sm font-medium text-[var(--coral)]">{error}</p> : null}
      {status ? (
        <p className="inline-flex items-center gap-2 rounded-[1rem] bg-[rgba(237,246,241,0.9)] px-4 py-3 text-sm font-medium text-[var(--teal)]">
          <CheckCircle2 className="size-4" /> {status}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        {isSaving ? "Saving profile..." : "Save learner setup"}
      </button>
    </form>
  );
}
