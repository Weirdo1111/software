import { cn } from "@/lib/utils";

export type BuddyStage = "fresh" | "growing" | "explorer" | "scholar";
export type BuddyMood = "calm" | "happy" | "proud";
export type BuddyFocus = "coursework" | "research" | "seminar";
export type BuddyVariant = "classic" | "cat" | "bunny" | "bear";

const paletteByFocus: Record<
  BuddyFocus,
  {
    shell: string;
    shellShadow: string;
    accent: string;
    trim: string;
    blush: string;
  }
> = {
  coursework: {
    shell: "#ffd26b",
    shellShadow: "#ffb65c",
    accent: "#5a7bff",
    trim: "#3a3556",
    blush: "#ffb7ad",
  },
  research: {
    shell: "#c8b4ff",
    shellShadow: "#9ac9ff",
    accent: "#35c7b3",
    trim: "#352f56",
    blush: "#ffbdd8",
  },
  seminar: {
    shell: "#ffbfd9",
    shellShadow: "#ff9b95",
    accent: "#ff9b4a",
    trim: "#3f3045",
    blush: "#ffb0c9",
  },
};

function renderStageAccessory(stage: BuddyStage, fill: string, trim: string) {
  if (stage === "fresh") {
    return (
      <>
        <path d="M116 24c-9-13-6-28 5-30 8 5 12 18 5 31" fill="#6fd46f" stroke={trim} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M125 26c5-15 17-18 26-10-2 11-13 17-25 15" fill="#92ec92" stroke={trim} strokeWidth="4.5" strokeLinecap="round" />
      </>
    );
  }

  if (stage === "growing") {
    return (
      <>
        <path d="M75 53c12-20 77-20 90 0l-9 10H84Z" fill={fill} stroke={trim} strokeWidth="5" strokeLinejoin="round" />
        <circle cx="96" cy="51" r="4" fill="#fff6f4" />
        <circle cx="144" cy="51" r="4" fill="#fff6f4" />
      </>
    );
  }

  if (stage === "explorer") {
    return (
      <>
        <path d="M86 38h69l-9 23H95Z" fill={fill} stroke={trim} strokeWidth="5" strokeLinejoin="round" />
        <path d="M119 8 145 38H93Z" fill="#fff6f1" stroke={trim} strokeWidth="5" strokeLinejoin="round" />
        <circle cx="119" cy="22" r="5" fill={fill} />
      </>
    );
  }

  return (
    <>
      <path d="M118 8 148 20l-12 26h-36L88 20Z" fill={fill} stroke={trim} strokeWidth="5" strokeLinejoin="round" />
      <circle cx="118" cy="26" r="7" fill="#fff7ee" />
      <path d="M92 49h52" stroke={fill} strokeWidth="8" strokeLinecap="round" />
    </>
  );
}

function renderVariantBackdrop(variant: BuddyVariant, fill: string, trim: string) {
  if (variant === "cat") {
    return (
      <>
        <path d="M78 69 92 29l24 30" fill={fill} stroke={trim} strokeWidth="5" strokeLinejoin="round" />
        <path d="m162 69-14-40-24 30" fill={fill} stroke={trim} strokeWidth="5" strokeLinejoin="round" />
      </>
    );
  }

  if (variant === "bunny") {
    return (
      <>
        <path d="M96 70c-10-26-10-53 4-61 14 5 15 35 9 62" fill="#fff7fb" stroke={trim} strokeWidth="5" strokeLinejoin="round" />
        <path d="M144 70c10-26 10-53-4-61-14 5-15 35-9 62" fill="#fff7fb" stroke={trim} strokeWidth="5" strokeLinejoin="round" />
        <path d="M101 26c0-6 3-10 7-12 3 4 4 8 3 14" fill={fill} opacity="0.8" />
        <path d="M139 26c0-6-3-10-7-12-3 4-4 8-3 14" fill={fill} opacity="0.8" />
      </>
    );
  }

  if (variant === "bear") {
    return (
      <>
        <circle cx="86" cy="62" r="17" fill={fill} stroke={trim} strokeWidth="5" />
        <circle cx="154" cy="62" r="17" fill={fill} stroke={trim} strokeWidth="5" />
        <circle cx="86" cy="62" r="7" fill="#fff7f0" opacity="0.84" />
        <circle cx="154" cy="62" r="7" fill="#fff7f0" opacity="0.84" />
      </>
    );
  }

  return null;
}

function renderFocusAccessory(focus: BuddyFocus, fill: string, trim: string) {
  if (focus === "research") {
    return (
      <>
        <circle cx="149" cy="151" r="16" fill="#fff9f3" stroke={trim} strokeWidth="5" />
        <path d="M160 163l12 12" stroke={trim} strokeWidth="6" strokeLinecap="round" />
        <circle cx="149" cy="151" r="8" fill={fill} opacity="0.82" />
      </>
    );
  }

  if (focus === "seminar") {
    return (
      <>
        <rect x="134" y="138" width="34" height="25" rx="12" fill="#fff8f4" stroke={trim} strokeWidth="5" />
        <path d="M146 160l-7 10" stroke={trim} strokeWidth="5" strokeLinecap="round" />
        <rect x="146" y="143" width="9" height="16" rx="4.5" fill={fill} />
      </>
    );
  }

  return (
    <>
      <rect x="131" y="139" width="38" height="30" rx="9" fill="#fff8f2" stroke={trim} strokeWidth="5" />
      <path d="M138 148h24" stroke={fill} strokeWidth="5" strokeLinecap="round" />
      <path d="M138 156h19" stroke={fill} strokeWidth="5" strokeLinecap="round" />
    </>
  );
}

function renderVariantFace(variant: BuddyVariant, fill: string, trim: string) {
  if (variant === "cat") {
    return (
      <>
        <path d="M92 145 76 141" stroke={trim} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M90 153 74 156" stroke={trim} strokeWidth="4.5" strokeLinecap="round" />
        <path d="m148 145 16-4" stroke={trim} strokeWidth="4.5" strokeLinecap="round" />
        <path d="m150 153 16 3" stroke={trim} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M112 136c4 5 12 5 16 0" fill="#fff5f5" stroke={trim} strokeWidth="4" strokeLinejoin="round" />
      </>
    );
  }

  if (variant === "bunny") {
    return (
      <>
        <ellipse cx="120" cy="142" rx="13" ry="10" fill="#fff9f7" stroke={trim} strokeWidth="4.5" />
        <path d="M120 141v11" stroke={trim} strokeWidth="4.2" strokeLinecap="round" />
        <path d="M113 154v8" stroke={trim} strokeWidth="4" strokeLinecap="round" />
        <path d="M127 154v8" stroke={trim} strokeWidth="4" strokeLinecap="round" />
      </>
    );
  }

  if (variant === "bear") {
    return (
      <>
        <ellipse cx="120" cy="143" rx="16" ry="12" fill="#fff8f1" stroke={trim} strokeWidth="4.5" />
        <ellipse cx="120" cy="141" rx="6" ry="5" fill={fill} opacity="0.82" />
      </>
    );
  }

  return null;
}

export function BuddyCompanion({
  stage,
  focus,
  mood = "happy",
  variant = "classic",
  float = true,
  className,
}: {
  stage: BuddyStage;
  focus: BuddyFocus;
  mood?: BuddyMood;
  variant?: BuddyVariant;
  float?: boolean;
  className?: string;
}) {
  const palette = paletteByFocus[focus];
  const mouthPath =
    mood === "proud"
      ? "M106 148c8 8 22 8 30 0"
      : mood === "calm"
        ? "M110 148c6 3 15 3 21 0"
        : "M105 146c8 10 24 10 32 0";

  return (
    <div className={cn("relative aspect-square w-full max-w-[22rem]", float && "buddy-float", className)}>
      <div className="buddy-halo absolute inset-[7%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.76),rgba(255,255,255,0.16)_55%,transparent_72%)]" />
      <svg viewBox="0 0 240 240" role="img" aria-label="DIICSU buddy companion" className="relative z-10 h-full w-full">
        <ellipse cx="120" cy="214" rx="72" ry="18" fill="rgba(70,82,142,0.14)" />
        {renderVariantBackdrop(variant, palette.accent, palette.trim)}
        <path
          d="M120 40c43 0 68 33 68 80 0 46-24 96-68 96s-68-50-68-96c0-47 25-80 68-80Z"
          fill={palette.shell}
          stroke={palette.trim}
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <path
          d="M120 53c35 0 55 26 55 63 0 34-18 71-55 71S65 150 65 116c0-37 20-63 55-63Z"
          fill={palette.shellShadow}
          opacity="0.52"
        />

        {renderStageAccessory(stage, palette.accent, palette.trim)}

        <ellipse cx="120" cy="166" rx="46" ry="28" fill="#fff7f2" opacity="0.94" />
        <path d="M70 126c-12 5-18 13-18 24 0 9 7 16 18 19" fill={palette.shell} stroke={palette.trim} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M170 126c12 5 18 13 18 24 0 9-7 16-18 19" fill={palette.shell} stroke={palette.trim} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M94 198c-6 8-8 13-7 18 2 5 8 7 16 4" stroke={palette.trim} strokeWidth="6" strokeLinecap="round" />
        <path d="M146 198c6 8 8 13 7 18-2 5-8 7-16 4" stroke={palette.trim} strokeWidth="6" strokeLinecap="round" />

        <ellipse cx="96" cy="118" rx="18" ry="20" fill={palette.trim} />
        <ellipse cx="144" cy="118" rx="18" ry="20" fill={palette.trim} />
        <ellipse cx="101" cy="112" rx="6" ry="7" fill="#ffffff" />
        <ellipse cx="149" cy="112" rx="6" ry="7" fill="#ffffff" />
        <ellipse cx="109" cy="122" rx="3.5" ry="4" fill="#ffffff" />
        <ellipse cx="157" cy="122" rx="3.5" ry="4" fill="#ffffff" />

        <ellipse cx="120" cy="135" rx="9" ry="7" fill="#ff8d8d" />
        {renderVariantFace(variant, palette.accent, palette.trim)}
        <path d={mouthPath} fill="none" stroke={palette.trim} strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="83" cy="143" rx="10" ry="7" fill={palette.blush} opacity="0.65" />
        <ellipse cx="157" cy="143" rx="10" ry="7" fill={palette.blush} opacity="0.65" />

        {renderFocusAccessory(focus, palette.accent, palette.trim)}
      </svg>
    </div>
  );
}
