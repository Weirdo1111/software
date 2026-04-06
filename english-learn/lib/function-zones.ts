import {
  Compass,
  Gamepad2,
  Glasses,
  Headphones,
  LibraryBig,
  MessageSquareMore,
  Mic,
  PenLine,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

import { type Locale } from "@/lib/i18n/dictionaries";

export type FunctionZoneId =
  | "challenge"
  | "tasks"
  | "listening"
  | "speaking"
  | "reading"
  | "writing"
  | "ai-coach"
  | "seminars"
  | "discussion"
  | "games";

export type FunctionZoneLink = {
  id: FunctionZoneId;
  label: string;
  href: string;
  Icon: LucideIcon;
  protected?: boolean;
};

function withLocale(pathname: string, locale: Locale) {
  return `${pathname}?lang=${locale}`;
}

export function getFunctionZoneLinks({
  locale,
  levelPrefix,
}: {
  locale: Locale;
  levelPrefix: string;
}): FunctionZoneLink[] {
  const speakingHref = withLocale(`/lesson/${levelPrefix}-speaking-starter`, locale);
  const writingHref = withLocale(`/lesson/${levelPrefix}-writing-starter`, locale);

  if (locale === "zh") {
    return [
      { id: "challenge", label: "挑战", href: withLocale("/challenge", locale), Icon: Compass },
      { id: "tasks", label: "任务", href: withLocale("/schedule", locale), Icon: Target },
      { id: "listening", label: "听力", href: withLocale("/listening", locale), Icon: Headphones },
      { id: "speaking", label: "口语", href: speakingHref, Icon: Mic },
      { id: "reading", label: "阅读", href: withLocale("/reading", locale), Icon: LibraryBig },
      { id: "writing", label: "写作", href: writingHref, Icon: PenLine },
      { id: "ai-coach", label: "AI陪练", href: withLocale("/discussion/roleplay", locale), Icon: Sparkles },
      { id: "seminars", label: "研讨室", href: withLocale("/discussion/seminars", locale), Icon: Glasses },
      { id: "discussion", label: "讨论区", href: withLocale("/discussion", locale), Icon: MessageSquareMore },
      { id: "games", label: "游戏区", href: withLocale("/games", locale), Icon: Gamepad2, protected: false },
    ];
  }

  return [
    { id: "challenge", label: "Challenge", href: withLocale("/challenge", locale), Icon: Compass },
    { id: "tasks", label: "Tasks", href: withLocale("/schedule", locale), Icon: Target },
    { id: "listening", label: "Listening", href: withLocale("/listening", locale), Icon: Headphones },
    { id: "speaking", label: "Speaking", href: speakingHref, Icon: Mic },
    { id: "reading", label: "Reading", href: withLocale("/reading", locale), Icon: LibraryBig },
    { id: "writing", label: "Writing", href: writingHref, Icon: PenLine },
    { id: "ai-coach", label: "AI Coach", href: withLocale("/discussion/roleplay", locale), Icon: Sparkles },
    { id: "seminars", label: "Seminars", href: withLocale("/discussion/seminars", locale), Icon: Glasses },
    { id: "discussion", label: "Discussion", href: withLocale("/discussion", locale), Icon: MessageSquareMore },
    { id: "games", label: "Games", href: withLocale("/games", locale), Icon: Gamepad2, protected: false },
  ];
}
