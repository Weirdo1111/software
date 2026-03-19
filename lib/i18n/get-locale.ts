import { type Locale } from "@/lib/i18n/dictionaries";

type SearchParams = Record<string, string | string[] | undefined>;

export async function getLocale(searchParams?: SearchParams | Promise<SearchParams>): Promise<Locale> {
  const resolved = await searchParams;
  const raw = resolved?.lang;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "en" ? "en" : "zh";
}
