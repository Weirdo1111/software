import { cn } from "@/lib/utils";
import type { BuddyOutfit } from "@/lib/buddy-wardrobe";

export type BuddyStage = "fresh" | "growing" | "explorer" | "scholar";
export type BuddyMood = "calm" | "happy" | "proud";
export type BuddyFocus = "coursework" | "research" | "seminar";
export type BuddyVariant = "classic" | "cat" | "bunny" | "bear";
export type BuddyFace = "happy" | "blink" | "blush" | "open" | "sleepy" | "surprised";

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

function renderBuddyEyes(face: BuddyFace, trim: string) {
  if (face === "blink") {
    return (
      <>
        <path d="M82 118c8-4 20-4 28 0" fill="none" stroke={trim} strokeWidth="5" strokeLinecap="round" />
        <path d="M130 118c8-4 20-4 28 0" fill="none" stroke={trim} strokeWidth="5" strokeLinecap="round" />
      </>
    );
  }

  if (face === "sleepy") {
    return (
      <>
        <path d="M80 120c8-6 21-6 30 0" fill="none" stroke={trim} strokeWidth="5" strokeLinecap="round" />
        <path d="M130 120c8-6 21-6 30 0" fill="none" stroke={trim} strokeWidth="5" strokeLinecap="round" />
      </>
    );
  }

  const eyeScale = face === "surprised" ? 1.12 : 1;
  const pupilScale = face === "surprised" ? 1.15 : 1;

  return (
    <>
      <ellipse cx="96" cy="118" rx={18 * eyeScale} ry={20 * eyeScale} fill={trim} />
      <ellipse cx="144" cy="118" rx={18 * eyeScale} ry={20 * eyeScale} fill={trim} />
      <ellipse cx="101" cy="112" rx={6 * pupilScale} ry={7 * pupilScale} fill="#ffffff" />
      <ellipse cx="149" cy="112" rx={6 * pupilScale} ry={7 * pupilScale} fill="#ffffff" />
      <ellipse cx="109" cy="122" rx={3.5 * pupilScale} ry={4 * pupilScale} fill="#ffffff" />
      <ellipse cx="157" cy="122" rx={3.5 * pupilScale} ry={4 * pupilScale} fill="#ffffff" />
    </>
  );
}

function renderBuddyMouth(face: BuddyFace, mood: BuddyMood, trim: string) {
  if (face === "open") {
    return (
      <>
        <ellipse cx="120" cy="150" rx="12" ry="10" fill="#fff8fb" stroke={trim} strokeWidth="5" />
        <path d="M112 152c4 4 12 4 16 0" fill="none" stroke="#ff8d8d" strokeWidth="4" strokeLinecap="round" />
      </>
    );
  }

  if (face === "surprised") {
    return <ellipse cx="120" cy="150" rx="9" ry="11" fill="#fff8fb" stroke={trim} strokeWidth="5" />;
  }

  const mouthPath =
    mood === "proud"
      ? "M106 148c8 8 22 8 30 0"
      : mood === "calm"
        ? "M110 148c6 3 15 3 21 0"
        : "M105 146c8 10 24 10 32 0";

  if (face === "sleepy") {
    return <path d="M108 149c6 2 18 2 24 0" fill="none" stroke={trim} strokeWidth="5" strokeLinecap="round" />;
  }

  return <path d={mouthPath} fill="none" stroke={trim} strokeWidth="5" strokeLinecap="round" />;
}

function renderBuddyBlush(face: BuddyFace, fill: string) {
  const opacity = face === "blush" ? 0.95 : 0.65;
  const rx = face === "blush" ? 12 : 10;
  const ry = face === "blush" ? 8 : 7;

  return (
    <>
      <ellipse cx="83" cy="143" rx={rx} ry={ry} fill={fill} opacity={opacity} />
      <ellipse cx="157" cy="143" rx={rx} ry={ry} fill={fill} opacity={opacity} />
    </>
  );
}

function hasCustomHeldItem(outfit: BuddyOutfit) {
  return outfit.heldItem !== "none";
}

function renderBuddyGlasses(outfit: BuddyOutfit, trim: string) {
  if (outfit.glasses === "square") {
    return (
      <>
        <rect x="72" y="96" width="43" height="36" rx="11" fill="rgba(255,255,255,0.26)" stroke={trim} strokeWidth="5" />
        <rect x="125" y="96" width="43" height="36" rx="11" fill="rgba(255,255,255,0.26)" stroke={trim} strokeWidth="5" />
        <path d="M115 114c2-1 8-1 10 0" fill="none" stroke={trim} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M69 112c-4 0-8 3-10 7" fill="none" stroke={trim} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M171 112c4 0 8 3 10 7" fill="none" stroke={trim} strokeWidth="4.5" strokeLinecap="round" />
      </>
    );
  }

  if (outfit.glasses === "sunglasses") {
    return (
      <>
        <rect x="70" y="97" width="44" height="31" rx="11" fill="#2d2948" stroke={trim} strokeWidth="5" />
        <rect x="126" y="97" width="44" height="31" rx="11" fill="#2d2948" stroke={trim} strokeWidth="5" />
        <path d="M114 111c3-1 9-1 12 0" fill="none" stroke={trim} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M67 110c-4 0-8 3-10 6" fill="none" stroke={trim} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M173 110c4 0 8 3 10 6" fill="none" stroke={trim} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M79 104c8-3 17-4 26-2" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.45" />
        <path d="M135 104c8-3 17-4 26-2" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.45" />
      </>
    );
  }

  if (outfit.glasses === "star") {
    return (
      <>
        <path d="m95 92 7 14 15 2-11 10 3 15-14-8-14 8 3-15-11-10 15-2Z" fill="#ffe27a" stroke={trim} strokeWidth="4.5" strokeLinejoin="round" />
        <path d="m145 92 7 14 15 2-11 10 3 15-14-8-14 8 3-15-11-10 15-2Z" fill="#ffe27a" stroke={trim} strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M113 112c2-1 12-1 14 0" fill="none" stroke={trim} strokeWidth="4.2" strokeLinecap="round" />
        <path d="M77 109c-4 0-8 3-10 7" fill="none" stroke={trim} strokeWidth="4.2" strokeLinecap="round" />
        <path d="M163 109c4 0 8 3 10 7" fill="none" stroke={trim} strokeWidth="4.2" strokeLinecap="round" />
      </>
    );
  }

  if (outfit.glasses === "heart") {
    return (
      <>
        <path d="M69 104c0-9 7-15 15-15 6 0 10 4 13 9 3-5 7-9 13-9 8 0 15 6 15 15 0 10-8 18-28 33-20-15-28-23-28-33Z" fill="#ff8fb3" stroke={trim} strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M121 104c0-9 7-15 15-15 6 0 10 4 13 9 3-5 7-9 13-9 8 0 15 6 15 15 0 10-8 18-28 33-20-15-28-23-28-33Z" fill="#ff8fb3" stroke={trim} strokeWidth="4.5" strokeLinejoin="round" />
      </>
    );
  }

  return null;
}

function renderBuddyHat(outfit: BuddyOutfit, trim: string) {
  if (outfit.hat === "sunhat") {
    return (
      <>
        <ellipse cx="120" cy="53" rx="66" ry="14" fill="#ffe198" stroke={trim} strokeWidth="5" />
        <path d="M76 53c0-34 88-34 88 0v13H76Z" fill="#ffd068" stroke={trim} strokeWidth="5" strokeLinejoin="round" />
        <path d="M91 47h58" stroke="#ff8fb3" strokeWidth="5" strokeLinecap="round" />
      </>
    );
  }

  if (outfit.hat === "strawhat") {
    return (
      <>
        <ellipse cx="120" cy="57" rx="76" ry="17" fill="#eec871" stroke={trim} strokeWidth="5" />
        <path d="M68 58c2-36 100-36 104 0v17H68Z" fill="#f5d88f" stroke={trim} strokeWidth="5" strokeLinejoin="round" />
        <path d="M86 51h68" stroke="#5a7bff" strokeWidth="5" strokeLinecap="round" />
      </>
    );
  }

  if (outfit.hat === "cap") {
    return (
      <>
        <path d="M62 68c8-40 108-40 116 0v16H62Z" fill="#7da1ff" stroke={trim} strokeWidth="5" strokeLinejoin="round" />
        <path d="M96 76c16-4 41 0 58 13-24 5-52 5-76 0 5-7 8-11 18-13Z" fill="#dbe7ff" stroke={trim} strokeWidth="5" strokeLinejoin="round" />
      </>
    );
  }

  return null;
}

function renderBuddyClothing(outfit: BuddyOutfit, trim: string) {
  if (outfit.clothing === "shorts") {
    return (
      <>
        <path d="M64 176c16-6 35-9 56-9s40 3 56 9l14 18c-19 7-43 10-70 10s-51-3-70-10Z" fill="#8ed8ff" stroke={trim} strokeWidth="5" strokeLinejoin="round" />
        <path d="M120 169v35" stroke={trim} strokeWidth="5" strokeLinecap="round" opacity="0.55" />
        <path d="M80 184c11 3 24 5 40 5s29-2 40-5" fill="none" stroke="#dff5ff" strokeWidth="5" strokeLinecap="round" />
      </>
    );
  }

  if (outfit.clothing === "jeans") {
    return (
      <>
        <path d="M66 172c16-6 34-9 54-9s38 3 54 9l16 32c-19 8-43 12-70 12s-51-4-70-12Z" fill="#6f87ff" stroke={trim} strokeWidth="5" strokeLinejoin="round" />
        <path d="M120 166v44" stroke="#c8d2ff" strokeWidth="5" strokeLinecap="round" />
        <path d="M74 180h92" stroke="#c8d2ff" strokeWidth="5" strokeLinecap="round" />
        <path d="M78 203c9 4 20 6 33 6" fill="none" stroke="#dfe6ff" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M162 203c-9 4-20 6-33 6" fill="none" stroke="#dfe6ff" strokeWidth="4.5" strokeLinecap="round" />
      </>
    );
  }

  if (outfit.clothing === "bloomers") {
    return (
      <>
        <path d="M64 174c16-7 35-10 56-10s40 3 56 10l16 22c-19 9-43 13-72 13s-53-4-72-13Z" fill="#ff9db0" stroke={trim} strokeWidth="5" strokeLinejoin="round" />
        <path d="M74 187c11 7 26 10 46 10s35-3 46-10" fill="none" stroke="#ffd7e4" strokeWidth="5" strokeLinecap="round" />
        <circle cx="97" cy="181" r="4.5" fill="#fff7ee" />
        <circle cx="143" cy="181" r="4.5" fill="#fff7ee" />
      </>
    );
  }

  return null;
}

function renderBuddyHeldItem(outfit: BuddyOutfit, trim: string, accent: string) {
  if (outfit.heldItem === "flower") {
    return (
      <>
        <path d="M153 154 165 178" stroke="#4aa867" strokeWidth="5" strokeLinecap="round" />
        <circle cx="160" cy="156" r="8.5" fill="#ff9db0" stroke={trim} strokeWidth="4" />
        <circle cx="168" cy="162" r="7.5" fill="#ffd35d" stroke={trim} strokeWidth="4" />
        <circle cx="151" cy="165" r="7.5" fill="#8ed8ff" stroke={trim} strokeWidth="4" />
      </>
    );
  }

  if (outfit.heldItem === "tea") {
    return (
      <>
        <path d="M148 146h24l-3 28h-18Z" fill="#fff8f1" stroke={trim} strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M155 137v10" stroke="#ff9b95" strokeWidth="4" strokeLinecap="round" />
        <path d="M166 137v10" stroke="#ff9b95" strokeWidth="4" strokeLinecap="round" />
        <path d="M148 156h24" stroke={accent} strokeWidth="4.5" strokeLinecap="round" />
      </>
    );
  }

  if (outfit.heldItem === "starwand") {
    return (
      <>
        <path d="M152 154 167 176" stroke="#8b6cf7" strokeWidth="5" strokeLinecap="round" />
        <path d="m158 143 4 9 10 1-7 6 2 9-8-5-8 5 2-9-7-6 10-1Z" fill="#ffd35d" stroke={trim} strokeWidth="4" strokeLinejoin="round" />
      </>
    );
  }

  return null;
}

export function BuddyCompanion({
  stage,
  focus,
  mood = "happy",
  face = "happy",
  variant = "classic",
  outfit,
  float = true,
  className,
}: {
  stage: BuddyStage;
  focus: BuddyFocus;
  mood?: BuddyMood;
  face?: BuddyFace;
  variant?: BuddyVariant;
  outfit?: BuddyOutfit;
  float?: boolean;
  className?: string;
}) {
  const palette = paletteByFocus[focus];
  const resolvedOutfit = outfit ?? { hat: "none", clothing: "none", glasses: "none", heldItem: "none" };
  const showDefaultFocusAccessory = !hasCustomHeldItem(resolvedOutfit);

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

        {renderBuddyHat(resolvedOutfit, palette.trim)}
        {renderStageAccessory(stage, palette.accent, palette.trim)}

        <ellipse cx="120" cy="166" rx="46" ry="28" fill="#fff7f2" opacity="0.94" />
        <path d="M70 126c-12 5-18 13-18 24 0 9 7 16 18 19" fill={palette.shell} stroke={palette.trim} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M170 126c12 5 18 13 18 24 0 9-7 16-18 19" fill={palette.shell} stroke={palette.trim} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M94 198c-6 8-8 13-7 18 2 5 8 7 16 4" stroke={palette.trim} strokeWidth="6" strokeLinecap="round" />
        <path d="M146 198c6 8 8 13 7 18-2 5-8 7-16 4" stroke={palette.trim} strokeWidth="6" strokeLinecap="round" />
        {renderBuddyClothing(resolvedOutfit, palette.trim)}

        {renderBuddyEyes(face, palette.trim)}
        {renderBuddyGlasses(resolvedOutfit, palette.trim)}

        <ellipse cx="120" cy="135" rx="9" ry="7" fill="#ff8d8d" />
        {renderVariantFace(variant, palette.accent, palette.trim)}
        {renderBuddyMouth(face, mood, palette.trim)}
        {renderBuddyBlush(face, palette.blush)}

        {showDefaultFocusAccessory ? renderFocusAccessory(focus, palette.accent, palette.trim) : null}
        {renderBuddyHeldItem(resolvedOutfit, palette.trim, palette.accent)}
      </svg>
    </div>
  );
}
