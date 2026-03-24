"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { type Locale } from "@/lib/i18n/dictionaries";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(nextLocale: Locale) {
    if (nextLocale === locale) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", nextLocale);
    window.localStorage.setItem("english-learn:locale", nextLocale);
    document.cookie = `english-learn-locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(255,251,246,0.84)] p-1 text-xs font-semibold shadow-[0_10px_28px_rgba(23,32,51,0.06)]">
      <button
        className={`rounded-full px-3 py-1 transition ${
          locale === "zh" ? "bg-[var(--navy)] text-[#f7efe3]" : "text-[var(--ink-soft)] hover:bg-[rgba(20,50,75,0.08)]"
        }`}
        onClick={() => onChange("zh")}
        type="button"
      >
        {"\u4e2d\u6587"}
      </button>
      <button
        className={`rounded-full px-3 py-1 transition ${
          locale === "en" ? "bg-[var(--navy)] text-[#f7efe3]" : "text-[var(--ink-soft)] hover:bg-[rgba(20,50,75,0.08)]"
        }`}
        onClick={() => onChange("en")}
        type="button"
      >
        EN
      </button>
    </div>
  );
}
