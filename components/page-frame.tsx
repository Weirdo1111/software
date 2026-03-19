import { Suspense, type ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { LanguageSwitcher } from "@/components/language-switcher";
import { type Locale, t } from "@/lib/i18n/dictionaries";

export function PageFrame({
  locale,
  title,
  description,
  children,
}: {
  locale: Locale;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10">
      <header className="surface-panel page-grid reveal-up overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl">
            <p className="section-label">Academic English Platform</p>
            <p className="mt-4 text-sm uppercase tracking-[0.28em] text-[var(--ink-soft)]">
              University learners • assessment-led • four-skill progression
            </p>
            <h1 className="font-display mt-3 text-4xl leading-tight tracking-tight sm:text-5xl">{title}</h1>
            {description ? <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">{description}</p> : null}
          </div>
          <div className="flex flex-col items-start gap-3 xl:items-end">
            <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
              <span className="metric-chip">Assessment first</span>
              <span className="metric-chip">Low / Medium / High</span>
              <span className="metric-chip">Progress + reassessment</span>
            </div>
            <Suspense fallback={<div className="h-9 w-28 rounded-full bg-black/10" />}>
              <LanguageSwitcher locale={locale} />
            </Suspense>
          </div>
        </div>
        <div className="data-rule my-6" />
        <AppShell locale={locale} />
      </header>
      <section className="flex-1">{children}</section>
      <footer className="pb-2 text-center text-xs uppercase tracking-[0.24em] text-[var(--ink-soft)]/80">
        {t(locale, "app_name")} • MVP interface
      </footer>
    </main>
  );
}
