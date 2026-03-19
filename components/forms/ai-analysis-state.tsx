"use client";

import { LoaderCircle, Sparkles } from "lucide-react";

export function AIAnalysisState({
  title,
  description,
  steps,
}: {
  title: string;
  description: string;
  steps: string[];
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="overflow-hidden rounded-[1.6rem] border border-[rgba(20,50,75,0.12)] bg-gradient-to-br from-[#f7ead2] via-white to-[#fdf5e8] p-5 shadow-[0_18px_36px_rgba(23,32,51,0.08)]"
    >
      <div className="flex items-start gap-4">
        <div className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--navy)] text-[#f7efe3]">
          <LoaderCircle className="size-5 animate-spin" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="section-label">
            <Sparkles className="size-3.5" /> AI analysis in progress
          </p>
          <h3 className="font-display mt-3 text-2xl tracking-tight text-[var(--ink)]">{title}</h3>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{description}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step}
            className="rounded-[1.15rem] border border-[rgba(20,50,75,0.1)] bg-white/80 px-4 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="block size-2.5 rounded-full bg-[#7b4b14] animate-pulse" />
                <span
                  className="block size-2.5 rounded-full bg-[#c8a16f] animate-pulse"
                  style={{ animationDelay: `${index * 180}ms` }}
                />
                <span
                  className="block size-2.5 rounded-full bg-[#e8d7bb] animate-pulse"
                  style={{ animationDelay: `${index * 360}ms` }}
                />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                Step {index + 1}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--ink)]">{step}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs leading-6 text-[var(--ink-soft)]">
        Keep this page open while the model prepares feedback. Complex prompts or busy periods can take a little
        longer.
      </p>
    </div>
  );
}
