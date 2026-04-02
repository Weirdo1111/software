import { HomeActionEntry } from "@/components/home/home-action-entry";
import Link from "next/link";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);

  const copy =
    locale === "zh"
      ? {
          title: "\u5b66\u4f34\u6821\u56ed\u9996\u9875",
          testTitle: "\u542c\u529b\u6d4b\u8bd5\u5165\u53e3",
          testDescription: "\u6bcf\u6b21\u968f\u673a\u62bd\u53d6 2 \u6761 TED \u542c\u529b\u6750\u6599\uff0c\u5b8c\u6210\u9898\u76ee\u540e\u81ea\u52a8\u8bc4\u5206\u3002",
          testCta: "\u5f00\u59cb\u542c\u529b\u6d4b\u8bd5",
        }
      : {
          title: "Buddy Campus Home",
          testTitle: "Listening Test Entry",
          testDescription: "Each session randomly selects 2 TED listening materials and scores answers automatically.",
          testCta: "Start listening test",
        };

  return (
    <PageFrame locale={locale} title={copy.title} showHeader={false}>
      <article className="rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-white p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl tracking-tight text-[var(--ink)]">{copy.testTitle}</h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">{copy.testDescription}</p>
          </div>
          <Link
            href={`/listening/test?lang=${locale}`}
            className="inline-flex items-center rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3]"
          >
            {copy.testCta}
          </Link>
        </div>
      </article>
      <HomeActionEntry locale={locale} />
    </PageFrame>
  );
}
