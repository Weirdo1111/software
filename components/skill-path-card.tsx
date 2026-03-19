import Link from "next/link";
import { Ear, FileText, Mic, PenLine } from "lucide-react";

import { cn } from "@/lib/utils";

const skillMeta = {
  listening: {
    label: "Listening",
    title: "Daily Listening Sprint",
    desc: "2 short clips + quick comprehension checks",
    icon: Ear,
    tone: "from-cyan-200/80 via-blue-100 to-white",
  },
  speaking: {
    label: "Speaking",
    title: "Pronunciation & Fluency",
    desc: "Read aloud + AI coaching in under 8 minutes",
    icon: Mic,
    tone: "from-lime-200/80 via-emerald-100 to-white",
  },
  reading: {
    label: "Reading",
    title: "Real-world Reading",
    desc: "Scannable texts with meaning and structure hints",
    icon: FileText,
    tone: "from-amber-200/80 via-orange-100 to-white",
  },
  writing: {
    label: "Writing",
    title: "Practical Writing Lab",
    desc: "Sentence upgrade and mini writing tasks",
    icon: PenLine,
    tone: "from-rose-200/80 via-pink-100 to-white",
  },
} as const;

type SkillKey = keyof typeof skillMeta;

export function SkillPathCard({
  skill,
  href,
  completed,
}: {
  skill: SkillKey;
  href: string;
  completed: number;
}) {
  const meta = skillMeta[skill];
  const Icon = meta.icon;

  return (
    <Link
      href={href}
      className={cn(
        "floating-card group relative overflow-hidden rounded-3xl border border-black/15 bg-gradient-to-br p-5 shadow-[0_18px_30px_rgba(16,22,40,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_38px_rgba(16,22,40,0.14)]",
        meta.tone,
      )}
    >
      <div className="absolute -right-5 -top-5 size-20 rounded-full bg-white/45 blur-xl transition group-hover:scale-125" aria-hidden />
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/55">{meta.label}</p>
      <div className="mt-3 inline-flex size-11 items-center justify-center rounded-2xl bg-black text-white">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-3 text-xl font-semibold tracking-tight">{meta.title}</h3>
      <p className="mt-2 text-sm text-black/65">{meta.desc}</p>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
        {completed}% completed
      </div>
    </Link>
  );
}
