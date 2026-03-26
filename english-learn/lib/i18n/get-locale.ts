import { type Locale } from "@/lib/i18n/dictionaries";
import { cookies } from "next/headers";

type SearchParams = Record<string, string | string[] | undefined>;

export async function getLocale(searchParams?: SearchParams | Promise<SearchParams>): Promise<Locale> {
  const resolved = await searchParams;
  const raw = resolved?.lang;
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (value === "zh" || value === "en") {
    return value;
  }

  const cookieStore = await cookies();
  const preferred = cookieStore.get("english-learn-locale")?.value;
  return preferred === "en" ? "en" : "zh";
}
