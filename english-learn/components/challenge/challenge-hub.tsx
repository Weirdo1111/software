"use client";

import Link from "next/link";
import { Compass, Headphones, Mic, Sparkles } from "lucide-react";

type Locale = "zh" | "en";

function withLang(pathname: string, locale: Locale) {
  return `${pathname}?lang=${locale}`;
}

export function ChallengeHub({ locale }: { locale: Locale }) {
  const text =
    locale === "zh"
      ? {
          eyebrow: "Challenge Center",
          title: "Skill Checks",
          description:
            "Choose a focused test route. Listening keeps the original random TED challenge, and speaking now runs a guided oral exam with AI questioning and scoring.",
          listeningTitle: "Listening Test",
          listeningBody: "Randomly draw TED materials, answer questions, and receive immediate scoring.",
          listeningMeta: "2 materials per round",
          speakingTitle: "Speaking Test",
          speakingBody:
            "Draw 1 set from 5 fixed oral exams, answer 3 questions, then receive detailed 100-point feedback.",
          speakingMeta: "3 questions per round",
          cta: "Open test",
        }
      : {
          eyebrow: "Challenge Center",
          title: "Skill Checks",
          description:
            "Choose a focused test route. Listening keeps the original random TED challenge, and speaking now runs a guided oral exam with AI questioning and scoring.",
          listeningTitle: "Listening Test",
          listeningBody: "Randomly draw TED materials, answer questions, and receive immediate scoring.",
          listeningMeta: "2 materials per round",
          speakingTitle: "Speaking Test",
          speakingBody:
            "Draw 1 set from 5 fixed oral exams, answer 3 questions, then receive detailed 100-point feedback.",
          speakingMeta: "3 questions per round",
          cta: "Open test",
        };

  const cards = [
    {
      href: withLang("/listening/test", locale),
      title: text.listeningTitle,
      body: text.listeningBody,
      meta: text.listeningMeta,
      icon: Headphones,
      accent:
        "from-[#fff7d1] via-[#ffe5b6] to-[#ffc3a1] text-[#7a4818] shadow-[0_18px_38px_rgba(255,179,106,0.22)]",
    },
    {
      href: withLang("/speaking/test", locale),
      title: text.speakingTitle,
      body: text.speakingBody,
      meta: text.speakingMeta,
      icon: Mic,
      accent:
        "from-[#dff7ff] via-[#d8f1ff] to-[#c5e0ff] text-[#214b7a] shadow-[0_18px_38px_rgba(122,170,255,0.2)]",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-[2.4rem] bg-[radial-gradient(circle_at_top_left,#fff4d6_0%,#f6fbff_42%,#e8f7f5_100%)] p-6 shadow-[0_24px_54px_rgba(34,49,49,0.1)] md:p-8">
      <div className="pointer-events-none absolute right-6 top-6 text-[#7a5cff]/10">
        <Sparkles className="size-20" />
      </div>
      <div className="pointer-events-none absolute bottom-6 left-6 text-[#ff9f8b]/15">
        <Compass className="size-24" />
      </div>

      <div className="relative">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7c6a37]">{text.eyebrow}</p>
        <h2 className="mt-3 max-w-2xl text-4xl font-black tracking-tight text-[#223131]">{text.title}</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#5c706f]">{text.description}</p>
      </div>

      <div className="relative mt-8 grid gap-5 md:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-[2rem] border border-white/80 bg-white/80 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white"
            >
              <div
                className={`inline-flex size-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-br ${card.accent}`}
              >
                <Icon className="size-6" />
              </div>
              <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#728382]">{card.meta}</p>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-[#223131]">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#5b6c6b]">{card.body}</p>
              <span className="mt-6 inline-flex items-center rounded-full bg-[#223131] px-4 py-2 text-sm font-bold text-white transition group-hover:bg-[#355352]">
                {text.cta}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
