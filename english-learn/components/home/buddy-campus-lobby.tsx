"use client";

// AI-assisted authorship note: this interactive lobby layout and movement flow
// were initially drafted with AI assistance and then adjusted by the team.

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Compass,
  Gamepad2,
  Headphones,
  MessageSquareMore,
  Mic,
  Sparkles,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import {
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  BuddyCompanion,
  type BuddyFocus,
  type BuddyStage,
  type BuddyVariant,
} from "@/components/home/buddy-companion";
import { type Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

type LobbyVector = {
  x: number;
  y: number;
};

type Direction = "up" | "down" | "left" | "right";

type LobbyZone = {
  id: string;
  title: string;
  note: string;
  hint: string;
  href: string;
  x: number;
  y: number;
  width: number;
  height: number;
  entry: LobbyVector;
  gradient: [string, string];
  Icon: LucideIcon;
};

const START_POSITION: LobbyVector = { x: 0.5, y: 0.8 };
const LOBBY_BOUNDS = {
  minX: 0.08,
  maxX: 0.92,
  minY: 0.14,
  maxY: 0.9,
};

function clampPosition(next: LobbyVector): LobbyVector {
  return {
    x: Math.min(LOBBY_BOUNDS.maxX, Math.max(LOBBY_BOUNDS.minX, next.x)),
    y: Math.min(LOBBY_BOUNDS.maxY, Math.max(LOBBY_BOUNDS.minY, next.y)),
  };
}

function getBuddyVariantFromFocus(focus: BuddyFocus): BuddyVariant {
  if (focus === "research") return "bunny";
  if (focus === "seminar") return "cat";
  return "bear";
}

export function BuddyCampusLobby({
  locale,
  levelPrefix,
  nextQuestHref,
  buddyStage,
  buddyFocus,
}: {
  locale: Locale;
  levelPrefix: string;
  nextQuestHref: string;
  buddyStage: BuddyStage;
  buddyFocus: BuddyFocus;
}) {
  const router = useRouter();
  const arenaRef = useRef<HTMLDivElement>(null);
  const arenaSizeRef = useRef({ width: 0, height: 0 });
  const destinationRef = useRef<LobbyVector | null>(null);
  const keysRef = useRef<Record<Direction, boolean>>({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const positionRef = useRef(START_POSITION);
  const movingRef = useRef(false);

  const [position, setPosition] = useState(START_POSITION);
  const [arenaSize, setArenaSize] = useState({ width: 0, height: 0 });
  const [keyboardEnabled, setKeyboardEnabled] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const clearDirections = useEffectEvent(() => {
    keysRef.current.up = false;
    keysRef.current.down = false;
    keysRef.current.left = false;
    keysRef.current.right = false;
  });

  const zones = useMemo<LobbyZone[]>(
    () => [
      {
        id: "quest-desk",
        title: locale === "zh" ? "任务总站" : "Quest Desk",
        note:
          locale === "zh"
            ? "先接收今天最重要的主线任务，再决定学习路线。"
            : "Pick up today's main quest before you branch into study routes.",
        hint: locale === "zh" ? "今日任务" : "Today's quest",
        href: nextQuestHref,
        x: 0.09,
        y: 0.12,
        width: 0.22,
        height: 0.24,
        entry: { x: 0.2, y: 0.4 },
        gradient: ["#ffb88a", "#ff8ea0"],
        Icon: Target,
      },
      {
        id: "listening-hall",
        title: locale === "zh" ? "听力资源馆" : "Listening Hall",
        note:
          locale === "zh"
            ? "TED、公开讲座、访谈与播客都从这里进入。"
            : "Jump into TED talks, public lectures, interviews, and podcasts here.",
        hint: locale === "zh" ? "TED + Real Talk" : "TED + Real Talk",
        href: `/listening?lang=${locale}`,
        x: 0.37,
        y: 0.07,
        width: 0.25,
        height: 0.23,
        entry: { x: 0.49, y: 0.34 },
        gradient: ["#69c8ff", "#78e5d0"],
        Icon: Headphones,
      },
      {
        id: "speaking-lab",
        title: locale === "zh" ? "口语演练舱" : "Speaking Lab",
        note:
          locale === "zh"
            ? "做课堂回答、汇报和研讨发言的场景训练。"
            : "Practice seminar turns, presentations, and class responses.",
        hint: locale === "zh" ? "AI 口语场景" : "AI speaking scenes",
        href: `/lesson/${levelPrefix}-speaking-starter?lang=${locale}`,
        x: 0.67,
        y: 0.13,
        width: 0.23,
        height: 0.24,
        entry: { x: 0.78, y: 0.41 },
        gradient: ["#ffc77d", "#ff9db0"],
        Icon: Mic,
      },
      {
        id: "buddy-square",
        title: locale === "zh" ? "学伴广场" : "Buddy Square",
        note:
          locale === "zh"
            ? "去论坛交流问题、分享资源和准备协作玩法。"
            : "Use the forum to swap resources, ask questions, and prepare for collaboration.",
        hint: locale === "zh" ? "论坛互动" : "Forum and socials",
        href: `/discussion?lang=${locale}`,
        x: 0.11,
        y: 0.58,
        width: 0.27,
        height: 0.23,
        entry: { x: 0.25, y: 0.76 },
        gradient: ["#9fd76f", "#69d4c1"],
        Icon: MessageSquareMore,
      },
      {
        id: "game-center",
        title: locale === "zh" ? "游戏中心" : "Game Center",
        note:
          locale === "zh"
            ? "直接进入公开的密室逃脱与关卡街机页，不用先登录也能查看。"
            : "Jump straight into the public arcade and escape-room stages without relying on the nav bar.",
        hint: locale === "zh" ? "密室逃脱入口" : "Escape room arcade",
        href: `/games?lang=${locale}`,
        x: 0.4,
        y: 0.56,
        width: 0.2,
        height: 0.23,
        entry: { x: 0.5, y: 0.77 },
        gradient: ["#ffd36f", "#ff9c8f"],
        Icon: Gamepad2,
      },
      {
        id: "reward-port",
        title: locale === "zh" ? "成长奖励港" : "Rewards Port",
        note:
          locale === "zh"
            ? "查看 XP、成长曲线和新的解锁奖励。"
            : "See your XP, growth curve, and newly unlocked rewards.",
        hint: locale === "zh" ? "成长与奖励" : "Growth and rewards",
        href: `/progress?lang=${locale}`,
        x: 0.62,
        y: 0.58,
        width: 0.26,
        height: 0.23,
        entry: { x: 0.75, y: 0.76 },
        gradient: ["#ffd75d", "#ffb18d"],
        Icon: Trophy,
      },
    ],
    [levelPrefix, locale, nextQuestHref],
  );
  const primaryBuddyVariant = getBuddyVariantFromFocus(buddyFocus);
  const buddyCrew = useMemo<
    Array<{
      id: string;
      title: string;
      note: string;
      stage: BuddyStage;
      focus: BuddyFocus;
      variant: BuddyVariant;
    }>
  >(
    () => [
      {
        id: "cloud-bun",
        title: locale === "zh" ? "云朵兔" : "Cloud Bun",
        note: locale === "zh" ? "偏研究型陪练" : "Research buddy",
        stage: "fresh",
        focus: "research",
        variant: "bunny",
      },
      {
        id: "spark-cat",
        title: locale === "zh" ? "星闪猫" : "Spark Cat",
        note: locale === "zh" ? "偏表达与对话" : "Speaking buddy",
        stage: "growing",
        focus: "seminar",
        variant: "cat",
      },
      {
        id: "compass-bear",
        title: locale === "zh" ? "指南熊" : "Compass Bear",
        note: locale === "zh" ? "偏任务与节奏" : "Quest buddy",
        stage: "explorer",
        focus: "coursework",
        variant: "bear",
      },
    ],
    [locale],
  );

  const activeZone = useMemo(() => {
    if (arenaSize.width <= 0 || arenaSize.height <= 0) return null;

    const petX = position.x * arenaSize.width;
    const petY = position.y * arenaSize.height;
    const activationDistance = Math.max(72, Math.min(120, Math.min(arenaSize.width, arenaSize.height) * 0.14));

    let nearest: { zone: LobbyZone; distance: number } | null = null;

    for (const zone of zones) {
      const dx = petX - zone.entry.x * arenaSize.width;
      const dy = petY - zone.entry.y * arenaSize.height;
      const distance = Math.hypot(dx, dy);

      if (distance <= activationDistance && (!nearest || distance < nearest.distance)) {
        nearest = { zone, distance };
      }
    }

    return nearest?.zone ?? null;
  }, [arenaSize.height, arenaSize.width, position.x, position.y, zones]);

  useEffect(() => {
    const updateSize = () => {
      const rect = arenaRef.current?.getBoundingClientRect();
      if (!rect) return;
      const nextSize = { width: rect.width, height: rect.height };
      arenaSizeRef.current = nextSize;
      setArenaSize(nextSize);
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    let animationFrame = 0;
    let lastTick = performance.now();

    const loop = (now: number) => {
      const delta = Math.min((now - lastTick) / 1000, 0.04);
      lastTick = now;

      const arena = arenaSizeRef.current;
      const current = positionRef.current;
      let next = current;
      let moved = false;

      if (destinationRef.current && arena.width > 0 && arena.height > 0) {
        const dx = destinationRef.current.x - current.x;
        const dy = destinationRef.current.y - current.y;
        const distancePixels = Math.hypot(dx * arena.width, dy * arena.height);

        if (distancePixels <= 8) {
          destinationRef.current = null;
        } else {
          const stepPixels = Math.min(distancePixels, 260 * delta);
          const ratio = stepPixels / distancePixels;
          next = clampPosition({
            x: current.x + dx * ratio,
            y: current.y + dy * ratio,
          });
          moved = true;
        }
      } else {
        let dx = 0;
        let dy = 0;

        if (keysRef.current.left) dx -= 1;
        if (keysRef.current.right) dx += 1;
        if (keysRef.current.up) dy -= 1;
        if (keysRef.current.down) dy += 1;

        if (dx !== 0 || dy !== 0) {
          const length = Math.hypot(dx, dy) || 1;
          const stepPixels = 245 * delta;
          next = clampPosition({
            x: current.x + (dx / length) * (stepPixels / Math.max(arena.width, 1)),
            y: current.y + (dy / length) * (stepPixels / Math.max(arena.height, 1)),
          });
          moved = true;
        }
      }

      if (next.x !== current.x || next.y !== current.y) {
        positionRef.current = next;
        setPosition(next);
      }

      if (moved !== movingRef.current) {
        movingRef.current = moved;
        setIsMoving(moved);
      }

      animationFrame = window.requestAnimationFrame(loop);
    };

    animationFrame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    window.addEventListener("pointerup", clearDirections);
    window.addEventListener("blur", clearDirections);

    return () => {
      window.removeEventListener("pointerup", clearDirections);
      window.removeEventListener("blur", clearDirections);
    };
  }, []);

  useEffect(() => {
    if (!keyboardEnabled) clearDirections();
  }, [keyboardEnabled]);

  useEffect(() => {
    if (!keyboardEnabled) return;

    const isFormField = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT");

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isFormField(event.target)) return;

      let handled = true;

      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        destinationRef.current = null;
        keysRef.current.left = true;
      } else if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        destinationRef.current = null;
        keysRef.current.right = true;
      } else if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
        destinationRef.current = null;
        keysRef.current.up = true;
      } else if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
        destinationRef.current = null;
        keysRef.current.down = true;
      } else if (event.key === "Enter" && activeZone) {
        router.push(activeZone.href);
      } else if (event.key === "Escape") {
        clearDirections();
        setKeyboardEnabled(false);
      } else {
        handled = false;
      }

      if (handled) event.preventDefault();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        keysRef.current.left = false;
      } else if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        keysRef.current.right = false;
      } else if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
        keysRef.current.up = false;
      } else if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
        keysRef.current.down = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      clearDirections();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activeZone, keyboardEnabled, router]);

  const moveTo = (target: LobbyVector) => {
    setKeyboardEnabled(true);
    destinationRef.current = clampPosition(target);
  };

  const handleArenaClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLElement && event.target.closest("button, a")) return;

    const rect = event.currentTarget.getBoundingClientRect();
    moveTo({
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    });
  };

  const beginDirection = (direction: Direction) => (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setKeyboardEnabled(true);
    destinationRef.current = null;
    keysRef.current[direction] = true;
  };

  const endDirection = (direction: Direction) => () => {
    keysRef.current[direction] = false;
  };

  const lobbyStatus = activeZone
    ? locale === "zh"
      ? `已靠近 ${activeZone.title}`
      : `Ready to enter ${activeZone.title}`
    : keyboardEnabled
      ? locale === "zh"
        ? "继续移动 Buddy，靠近入口即可进入。"
        : "Keep moving your buddy toward a building to enter it."
      : locale === "zh"
        ? "点击大厅后可用 WASD / 方向键移动。"
        : "Click the lobby, then use WASD or arrow keys to move.";

  return (
    <article className="campus-card bg-[linear-gradient(165deg,rgba(255,255,255,0.99),rgba(245,249,255,0.95),rgba(255,244,250,0.92))] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-label">
            <Compass className="size-3.5" />
            {locale === "zh" ? "互动大厅" : "Interactive Lobby"}
          </p>
          <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
            {locale === "zh" ? "像进入校园大厅一样进入每个学习板块。" : "Enter each study area the way you would enter a campus hall."}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="buddy-chip">
            <Sparkles className="size-4 text-[var(--coral)]" />
            {locale === "zh" ? "WASD / 方向键" : "WASD / arrows"}
          </span>
          <span className="buddy-chip">
            <Compass className="size-4 text-[var(--teal)]" />
            {locale === "zh" ? "点击地面自动走" : "Tap floor to walk"}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div>
          <div
            ref={arenaRef}
            tabIndex={0}
            onFocus={() => setKeyboardEnabled(true)}
            onPointerDown={() => setKeyboardEnabled(true)}
            onClick={handleArenaClick}
            className={cn("campus-lobby", keyboardEnabled && "campus-lobby-focused")}
            role="region"
            aria-label={locale === "zh" ? "DIICSU 学习大厅" : "DIICSU learning lobby"}
          >
            <span className="campus-lobby-dawn" />
            <span className="campus-lobby-tower">
              <span className="campus-lobby-tower-clock" />
            </span>
            <span className="campus-lobby-paper-plane" />
            <span className="campus-lobby-sheet campus-lobby-sheet-one" />
            <span className="campus-lobby-sheet campus-lobby-sheet-two" />
            <span className="campus-lobby-sheet campus-lobby-sheet-three" />
            <span className="campus-lobby-book-stack">
              <span className="campus-lobby-book campus-lobby-book-blue" />
              <span className="campus-lobby-book campus-lobby-book-pink" />
              <span className="campus-lobby-book campus-lobby-book-cyan" />
              <span className="campus-lobby-book campus-lobby-book-peach" />
            </span>
            <span className="campus-lobby-compass" />
            <span className="campus-lobby-letters" aria-hidden="true">
              <span>A</span>
              <span>B</span>
              <span>C</span>
            </span>
            <span className="campus-lobby-globe">
              <span className="campus-lobby-globe-ring" />
              <span className="campus-lobby-globe-stand" />
            </span>
            <span className="campus-lobby-spark campus-lobby-spark-right" />
            <span className="campus-lobby-spark campus-lobby-spark-left" />
            <span className="campus-lobby-cloud campus-lobby-cloud-left" />
            <span className="campus-lobby-cloud campus-lobby-cloud-mid" />
            <span className="campus-lobby-cloud campus-lobby-cloud-right" />
            <div className="campus-lobby-fountain">
              <div className="campus-lobby-fountain-core" />
            </div>

            {zones.map((zone) => {
              const isActive = activeZone?.id === zone.id;
              const style = {
                left: `${zone.x * 100}%`,
                top: `${zone.y * 100}%`,
                width: `${zone.width * 100}%`,
                height: `${zone.height * 100}%`,
                "--zone-start": zone.gradient[0],
                "--zone-end": zone.gradient[1],
              } as CSSProperties;

              return (
                <button
                  key={zone.id}
                  type="button"
                  style={style}
                  onClick={(event) => {
                    event.stopPropagation();
                    moveTo(zone.entry);
                  }}
                  className={cn("campus-lobby-zone", isActive && "campus-lobby-zone-active")}
                >
                  <span className="campus-lobby-zone-icon">
                    <zone.Icon className="size-5" />
                  </span>
                  <span className="text-sm font-semibold text-[var(--ink)]">{zone.title}</span>
                  <span className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">{zone.hint}</span>
                </button>
              );
            })}

            <div
              className="campus-lobby-pet"
              style={{
                left: `${position.x * 100}%`,
                top: `${position.y * 100}%`,
              }}
              data-moving={isMoving ? "true" : "false"}
            >
              <span className="campus-lobby-pet-shadow" />
              <span className="campus-lobby-pet-ring" />
              <BuddyCompanion
                stage={buddyStage}
                focus={buddyFocus}
                mood={activeZone ? "proud" : "happy"}
                variant={primaryBuddyVariant}
                float={false}
                className="relative z-10 w-[4.8rem] max-w-[4.8rem] drop-shadow-[0_18px_22px_rgba(63,85,129,0.16)]"
              />
            </div>

            {activeZone ? (
              <div
                className="campus-lobby-enter"
                style={{
                  left: `${activeZone.entry.x * 100}%`,
                  top: `${Math.max(12, (activeZone.entry.y - 0.13) * 100)}%`,
                }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  {locale === "zh" ? "可进入区域" : "Ready to enter"}
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--ink)]">{activeZone.title}</p>
                <Link href={activeZone.href} className="campus-lobby-enter-button">
                  {locale === "zh" ? "进入" : "Enter"}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : null}

            <div className="campus-lobby-status">
              <span className="campus-lobby-status-dot" />
              <span>{lobbyStatus}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {zones.map((zone) => (
              <button key={zone.id} type="button" onClick={() => moveTo(zone.entry)} className="pet-sticker transition hover:-translate-y-0.5">
                {zone.title}
              </button>
            ))}
          </div>
        </div>

        <aside className="campus-lobby-panel">
          <div className="campus-lobby-panel-card">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              {locale === "zh" ? "当前区域" : "Current zone"}
            </p>
            <h4 className="mt-3 text-xl font-semibold text-[var(--ink)]">
              {activeZone?.title ?? (locale === "zh" ? "中央大厅" : "Central Hall")}
            </h4>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
              {activeZone?.note ??
                (locale === "zh"
                  ? "先点击大厅或使用下面的方向键移动 Buddy。靠近建筑后会自动高亮，并可直接进入。"
                  : "Click the lobby or use the pad below to move your buddy. Buildings highlight when you get close enough to enter.")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {activeZone ? (
                <Link href={activeZone.href} className="party-button">
                  {locale === "zh" ? "进入这个板块" : "Open this area"}
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <button type="button" onClick={() => moveTo(zones[1]?.entry ?? START_POSITION)} className="party-button">
                  {locale === "zh" ? "前往听力馆" : "Walk to listening"}
                  <ArrowRight className="size-4" />
                </button>
              )}
            </div>
          </div>

          <div className="campus-lobby-panel-card">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              {locale === "zh" ? "方向控制" : "Directional pad"}
            </p>
            <div className="campus-lobby-pad mt-4">
              <span />
              <button
                type="button"
                onPointerDown={beginDirection("up")}
                onPointerUp={endDirection("up")}
                onPointerLeave={endDirection("up")}
                className="campus-lobby-pad-button"
                aria-label={locale === "zh" ? "向上移动" : "Move up"}
              >
                <ArrowUp className="size-4" />
              </button>
              <span />
              <button
                type="button"
                onPointerDown={beginDirection("left")}
                onPointerUp={endDirection("left")}
                onPointerLeave={endDirection("left")}
                className="campus-lobby-pad-button"
                aria-label={locale === "zh" ? "向左移动" : "Move left"}
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                onPointerDown={beginDirection("down")}
                onPointerUp={endDirection("down")}
                onPointerLeave={endDirection("down")}
                className="campus-lobby-pad-button"
                aria-label={locale === "zh" ? "向下移动" : "Move down"}
              >
                <ArrowDown className="size-4" />
              </button>
              <button
                type="button"
                onPointerDown={beginDirection("right")}
                onPointerUp={endDirection("right")}
                onPointerLeave={endDirection("right")}
                className="campus-lobby-pad-button"
                aria-label={locale === "zh" ? "向右移动" : "Move right"}
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
            <p className="mt-4 text-xs leading-6 text-[var(--ink-soft)]">
              {locale === "zh"
                ? "桌面端可点击大厅后使用 WASD / 方向键，手机端可直接按这个方向面板。"
                : "On desktop, click the lobby then use WASD or the arrow keys. On mobile, use this on-screen pad."}
            </p>
          </div>

          <div className="campus-lobby-panel-card">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              {locale === "zh" ? "桌宠小队" : "Buddy crew"}
            </p>
            <div className="campus-lobby-crew mt-4">
              {buddyCrew.map((buddy) => (
                <div key={buddy.id} className="campus-lobby-crew-card">
                  <BuddyCompanion
                    stage={buddy.stage}
                    focus={buddy.focus}
                    variant={buddy.variant}
                    mood="happy"
                    float={false}
                    className="w-[3.9rem] max-w-[3.9rem]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[var(--ink)]">{buddy.title}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">{buddy.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
