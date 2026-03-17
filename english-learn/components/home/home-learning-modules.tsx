import { Ear, FileText, Mic, PenLine, Target } from "lucide-react";

import { learningModules } from "@/lib/academic-ui";

const skillIcons = {
  listening: Ear,
  speaking: Mic,
  reading: FileText,
  writing: PenLine,
} as const;

export function HomeLearningModules() {
  return (
    <section className="mt-6 reveal-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-label">
            <Target className="size-3.5" /> Learning modules
          </p>
          <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">The four-skill academic learning loop.</h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
          Each module needs to look connected to the same academic objective, not like four unrelated mini tools.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {learningModules.map((module) => {
          const Icon = skillIcons[module.skill];

          return (
            <article
              key={module.skill}
              className={`rounded-[1.8rem] border border-[rgba(20,50,75,0.12)] bg-gradient-to-br ${module.surfaceClass} p-5 shadow-[0_18px_40px_rgba(23,32,51,0.08)]`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">{module.minutes}</p>
                  <h3 className="font-display mt-3 text-2xl tracking-tight">{module.title}</h3>
                </div>
                <div className={`inline-flex size-11 items-center justify-center rounded-2xl ${module.badgeClass}`}>
                  <Icon className="size-5" />
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">{module.summary}</p>
              <div className="mt-5 space-y-3 text-sm text-[var(--ink)]">
                <p>
                  <span className="font-semibold">Focus:</span> {module.focus}
                </p>
                <p>
                  <span className="font-semibold">Output:</span> {module.deliverable}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
