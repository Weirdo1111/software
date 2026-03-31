"use client";

import Link from "next/link";
import { Ear, FileText, Mic, PenLine } from "lucide-react";
import { useMemo, useState } from "react";

const cards = [
  {
    key: "listening",
    title: "Listening Burst",
    desc: "3-min clip + key-detail challenge",
    href: "/listening",
    icon: Ear,
    tone: "from-sky-200/80 to-cyan-100",
  },
  {
    key: "speaking",
    title: "Speaking Burst",
    desc: "Prompt response + AI pronunciation feedback",
    id: "A2-speaking-starter",
    icon: Mic,
    tone: "from-lime-200/80 to-emerald-100",
  },
  {
    key: "reading",
    title: "Reading Library",
    desc: "Topic search + full articles + saved reading history",
    href: "/reading",
    icon: FileText,
    tone: "from-amber-200/80 to-orange-100",
  },
  {
    key: "writing",
    title: "Writing Burst",
    desc: "Sentence fix + mini rewrite",
    id: "A2-writing-starter",
    icon: PenLine,
    tone: "from-rose-200/80 to-pink-100",
  },
] as const;

export function SwipeSkillCarousel({ locale }: { locale: "zh" | "en" }) {
  const [index, setIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const card = useMemo(() => cards[index], [index]);

  function next() {
    setIndex((prev) => (prev + 1) % cards.length);
  }

  function prev() {
    setIndex((prev) => (prev - 1 + cards.length) % cards.length);
  }

  return (
    <section className="rounded-3xl border border-black/15 bg-white p-5 md:hidden">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">Swipe Skill Deck</h2>
        <p className="text-xs text-black/55">Swipe left/right</p>
      </div>

      <article
        className={`rounded-2xl border border-black/12 bg-gradient-to-br ${card.tone} p-4`}
        onTouchStart={(event) => setTouchStartX(event.changedTouches[0]?.clientX ?? null)}
        onTouchEnd={(event) => {
          const endX = event.changedTouches[0]?.clientX;
          if (touchStartX === null || typeof endX !== "number") return;
          const diff = endX - touchStartX;
          if (diff < -35) next();
          if (diff > 35) prev();
          setTouchStartX(null);
        }}
      >
        <div className="inline-flex size-10 items-center justify-center rounded-xl bg-black text-white">
          <card.icon className="size-5" />
        </div>
        <h3 className="mt-3 text-lg font-semibold tracking-tight">{card.title}</h3>
        <p className="mt-1 text-sm text-black/65">{card.desc}</p>

        <Link
          href={"href" in card ? `${card.href}?lang=${locale}` : `/lesson/${card.id}?lang=${locale}`}
          className="mt-4 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          {"href" in card ? "Open Library" : "Start Burst"}
        </Link>
      </article>

      <div className="mt-3 flex items-center gap-2">
        {cards.map((item, dotIndex) => (
          <span
            key={item.key}
            className={`h-2 rounded-full transition ${dotIndex === index ? "w-6 bg-black" : "w-2 bg-black/25"}`}
          />
        ))}
      </div>
    </section>
  );
}
