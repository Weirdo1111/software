import { Suspense, type ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { InstitutionBrand } from "@/components/institution-brand";
import { LanguageSwitcher } from "@/components/language-switcher";
import { type Locale, t } from "@/lib/i18n/dictionaries";

export function PageFrame({
  locale,
  title,
  description,
  children,
  showHeader = true,
}: {
  locale: Locale;
  title: string;
  description?: string;
  children: ReactNode;
  showHeader?: boolean;
}) {
  const frameCopy =
    locale === "zh"
      ? {
          label: "DIICSU Academic English",
          eyebrow: "面向 DIICSU 本科生的学术英语支持",
          chips: ["DIICSU 学术语境", "Seminar / Coursework", "Feedback with progression"],
          footer: "English Learn Academic - DIICSU interface",
        }
      : {
          label: "DIICSU Academic English",
          eyebrow:
            "Built for DIICSU undergraduates, English-medium study, and visible academic progression.",
          chips: ["DIICSU cues", "Seminar / Coursework", "Feedback with progression"],
          footer: "English Learn Academic - DIICSU interface",
        };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10">
      <div className="z-[70]">
        <AppShell locale={locale} />
      </div>

      {showHeader ? (
        <header className="surface-panel page-grid reveal-up rounded-[2rem] p-6 sm:p-8">
          <div className="header-brand-row">
            <InstitutionBrand locale={locale} />
          </div>

          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl">
              <p className="section-label institution-label">{frameCopy.label}</p>
              <p className="mt-4 text-sm uppercase tracking-[0.28em] text-[var(--ink-soft)]">{frameCopy.eyebrow}</p>
              <h1 className="font-display mt-3 text-4xl leading-tight tracking-tight sm:text-5xl">{title}</h1>
              {description ? (
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">{description}</p>
              ) : null}
            </div>

            <div className="flex flex-col items-start gap-3 xl:items-end">
              <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                {frameCopy.chips.map((chip) => (
                  <span key={chip} className="metric-chip">
                    {chip}
                  </span>
                ))}
              </div>

              <Suspense fallback={<div className="h-9 w-28 rounded-full bg-black/10" />}>
                <LanguageSwitcher locale={locale} />
              </Suspense>
            </div>
          </div>

          <div className="data-rule my-6" />
        </header>
      ) : (
        <div className="flex justify-end">
          <Suspense fallback={<div className="h-9 w-28 rounded-full bg-black/10" />}>
            <LanguageSwitcher locale={locale} />
          </Suspense>
        </div>
      )}

      <section className="flex-1">{children}</section>

      <footer className="pb-2 text-center text-xs uppercase tracking-[0.24em] text-[var(--ink-soft)]/80">
        {frameCopy.footer || `${t(locale, "app_name")} - MVP interface`}
      </footer>
    </main>
  );
}
