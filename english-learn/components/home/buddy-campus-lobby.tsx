"use client";

// AI-assisted authorship note: this interactive lobby layout and movement flow
// were initially drafted with AI assistance and then adjusted by the team.

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
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
import { type BuddyOutfit } from "@/lib/buddy-wardrobe";
import { startBuddyWalkLoop, stopBuddyWalkLoop, unlockBuddySound } from "@/lib/buddy-sound";
import { type Locale } from "@/lib/i18n/dictionaries";
import { type ScheduleGoal } from "@/lib/schedule";
import { startNavigationLoading } from "@/lib/navigation-loading";
import { cn } from "@/lib/utils";

type LobbyVector = {
  x: number;
  y: number;
};

type Direction = "up" | "down" | "left" | "right";
type FacingDirection = "left" | "right";

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
  maxY: 0.84,
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
  buddyOutfit,
  selectedGoal,
  onSelectGoal,
}: {
  locale: Locale;
  levelPrefix: string;
  nextQuestHref: string;
  buddyStage: BuddyStage;
  buddyFocus: BuddyFocus;
  buddyOutfit: BuddyOutfit;
  selectedGoal: ScheduleGoal;
  onSelectGoal?: (goal: ScheduleGoal) => void;
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
  const [facing, setFacing] = useState<FacingDirection>("right");

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
        x: 0.05,
        y: 0.21,
        width: 0.23,
        height: 0.22,
        entry: { x: 0.17, y: 0.47 },
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
        x: 0.33,
        y: 0.14,
        width: 0.28,
        height: 0.23,
        entry: { x: 0.47, y: 0.39 },
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
        x: 0.72,
        y: 0.21,
        width: 0.2,
        height: 0.21,
        entry: { x: 0.82, y: 0.47 },
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
        x: 0.05,
        y: 0.61,
        width: 0.25,
        height: 0.16,
        entry: { x: 0.18, y: 0.74 },
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
        y: 0.68,
        width: 0.21,
        height: 0.15,
        entry: { x: 0.5, y: 0.78 },
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
        x: 0.7,
        y: 0.61,
        width: 0.22,
        height: 0.16,
        entry: { x: 0.81, y: 0.74 },
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
      goal: ScheduleGoal;
      stage: BuddyStage;
      focus: BuddyFocus;
      variant: BuddyVariant;
    }>
  >(
    () => [
      {
        id: "cloud-bun",
        goal: "research",
        title: locale === "zh" ? "云朵兔" : "Cloud Bun",
        note: locale === "zh" ? "偏研究型陪练" : "Research buddy",
        stage: "fresh",
        focus: "research",
        variant: "bunny",
      },
      {
        id: "spark-cat",
        goal: "seminar",
        title: locale === "zh" ? "星闪猫" : "Spark Cat",
        note: locale === "zh" ? "偏表达与对话" : "Speaking buddy",
        stage: "growing",
        focus: "seminar",
        variant: "cat",
      },
      {
        id: "compass-bear",
        goal: "coursework",
        title: locale === "zh" ? "指南熊" : "Compass Bear",
        note: locale === "zh" ? "偏任务与节奏" : "Quest buddy",
        stage: "explorer",
        focus: "coursework",
        variant: "bear",
      },
    ],
    [locale],
  );
  const leftWingZones = useMemo(
    () => zones.filter((zone) => ["quest-desk", "listening-hall", "buddy-square"].includes(zone.id)),
    [zones],
  );
  const rightWingZones = useMemo(
    () => zones.filter((zone) => ["speaking-lab", "game-center", "reward-port"].includes(zone.id)),
    [zones],
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
        if (next.x < current.x - 0.0005) {
          setFacing("left");
        } else if (next.x > current.x + 0.0005) {
          setFacing("right");
        }
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
    return () => {
      window.cancelAnimationFrame(animationFrame);
      stopBuddyWalkLoop();
    };
  }, []);

  useEffect(() => {
    if (isMoving) {
      void startBuddyWalkLoop();
      return;
    }

    stopBuddyWalkLoop();
  }, [isMoving]);

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
        startNavigationLoading(activeZone.href);
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
    void unlockBuddySound();
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
  const suggestedZone = zones[1] ?? zones[0] ?? null;

  return (
    <article className="campus-card bg-[linear-gradient(165deg,rgba(255,255,255,0.99),rgba(245,249,255,0.95),rgba(255,244,250,0.92))] p-6">
      <div>
        <div>
          <p className="section-label">
            <Compass className="size-3.5" />
            {locale === "zh" ? "互动大厅" : "Interactive Lobby"}
          </p>
          <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
            {locale === "zh" ? "像进入校园大厅一样进入每个学习板块。" : "Enter each study area the way you would enter a campus hall."}
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ink-soft)]">
            {locale === "zh"
              ? "现在首页不只是入口列表，而是一个可以控制 Buddy 移动的大厅。走到听力、口语、论坛、游戏中心和奖励区附近，就能直接进入对应模块。"
              : "Home is no longer just a list of links. Move your buddy across the lobby and step near listening, speaking, forum, game-center, and reward spaces to open them."}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="campus-lobby-topbar">
          <div className="campus-lobby-topbar-chips">
            <span className="buddy-chip">
              <Sparkles className="size-4 text-[var(--coral)]" />
              {locale === "zh" ? "WASD / 方向键" : "WASD / arrows"}
            </span>
            <span className="buddy-chip">
              <Compass className="size-4 text-[var(--teal)]" />
              {locale === "zh" ? "点击地面自动走" : "Tap floor to walk"}
            </span>
          </div>

          <div className="campus-lobby-crew-board">
            <p className="campus-lobby-crew-label">
              {locale === "zh" ? "桌宠小队" : "Buddy crew"}
            </p>
            <div className="campus-lobby-crew-inline">
              {buddyCrew.map((buddy) => (
                <button
                  key={buddy.id}
                  type="button"
                  onClick={() => onSelectGoal?.(buddy.goal)}
                  className={cn(
                    "campus-lobby-crew-pill text-left transition hover:-translate-y-0.5",
                    selectedGoal === buddy.goal && "campus-lobby-crew-card-active",
                  )}
                  aria-pressed={selectedGoal === buddy.goal}
                >
                  <BuddyCompanion
                    stage={buddy.stage}
                    focus={buddy.focus}
                    variant={buddy.variant}
                    mood="happy"
                    outfit={buddyOutfit}
                    float={false}
                    className="w-[2.5rem] max-w-[2.5rem]"
                  />
                  <div>
                    <p className="text-xs font-semibold text-[var(--ink)]">{buddy.title}</p>
                    <p className="text-[11px] leading-4 text-[var(--ink-soft)]">{buddy.note}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          ref={arenaRef}
          tabIndex={0}
          onFocus={() => setKeyboardEnabled(true)}
          onPointerDown={() => setKeyboardEnabled(true)}
          onClick={handleArenaClick}
          className={cn("campus-lobby campus-lobby-expanded", keyboardEnabled && "campus-lobby-focused")}
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
            data-facing={facing}
          >
            <span className="campus-lobby-pet-shadow" />
            <span className="campus-lobby-pet-ring" />
            <div className="campus-lobby-pet-body">
              <BuddyCompanion
                stage={buddyStage}
                focus={buddyFocus}
                mood={activeZone ? "proud" : "happy"}
                variant={primaryBuddyVariant}
                outfit={buddyOutfit}
                float={false}
                className="relative z-10 w-[4.8rem] max-w-[4.8rem] drop-shadow-[0_18px_22px_rgba(63,85,129,0.16)]"
              />
            </div>
          </div>
        </div>

        <div className="campus-lobby-support">
          <div className="campus-lobby-wing">
            <p className="campus-lobby-wing-label">
              {locale === "zh" ? "左侧学习区" : "Left learning wing"}
            </p>
            <p className="campus-lobby-wing-note">
              {locale === "zh"
                ? "任务、听力和论坛入口都收进学习广场外侧控制区。"
                : "Quest, listening, and forum routes now sit beside the plaza instead of on top of it."}
            </p>
            <div className="campus-lobby-wing-grid">
              {leftWingZones.map((zone) => {
                const isActive = activeZone?.id === zone.id;

                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => moveTo(zone.entry)}
                    className={cn("campus-lobby-wing-button", isActive && "campus-lobby-wing-button-active")}
                  >
                    <span className="campus-lobby-wing-icon">
                      <zone.Icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{zone.title}</span>
                      <span className="campus-lobby-wing-button-hint">{zone.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="campus-lobby-control-deck">
            <div className="campus-lobby-status">
              <span className="campus-lobby-status-dot" />
              <span>{lobbyStatus}</span>
            </div>

            <div className="campus-lobby-active-card">
              <p className="campus-lobby-active-label">
                {activeZone
                  ? locale === "zh"
                    ? "可进入区域"
                    : "Ready to enter"
                  : locale === "zh"
                    ? "移动提示"
                    : "Movement tip"}
              </p>
              <p className="mt-2 text-xl font-semibold text-[var(--ink)]">
                {activeZone?.title ?? (locale === "zh" ? "先走近一个学习建筑" : "Walk closer to a study building")}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                {activeZone?.note ??
                  (locale === "zh"
                    ? "点击学习广场后，用 WASD / 方向键移动，或者直接点建筑让桌宠自动走过去。"
                    : "Click the plaza first, then use WASD or arrow keys, or tap a building to auto-walk your buddy there.")}
              </p>
              {activeZone ? (
                <Link href={activeZone.href} className="campus-lobby-enter-button">
                  {locale === "zh" ? "进入" : "Enter"}
                  <ArrowRight className="size-4" />
                </Link>
              ) : suggestedZone ? (
                <button type="button" onClick={() => moveTo(suggestedZone.entry)} className="campus-lobby-enter-button">
                  {locale === "zh" ? "前往学习区" : "Walk to a zone"}
                  <ArrowRight className="size-4" />
                </button>
              ) : null}
            </div>

            <div className="campus-lobby-paths">
              {zones.map((zone) => {
                const isActive = activeZone?.id === zone.id;

                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => moveTo(zone.entry)}
                    className={cn("campus-lobby-path-pill", isActive && "campus-lobby-path-pill-active")}
                  >
                    <zone.Icon className="size-4" />
                    {zone.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="campus-lobby-wing">
            <p className="campus-lobby-wing-label">
              {locale === "zh" ? "右侧学习区" : "Right learning wing"}
            </p>
            <p className="campus-lobby-wing-note">
              {locale === "zh"
                ? "口语、游戏和成长奖励也放到了广场外侧。"
                : "Speaking, games, and rewards also live outside the plaza now."}
            </p>
            <div className="campus-lobby-wing-grid">
              {rightWingZones.map((zone) => {
                const isActive = activeZone?.id === zone.id;

                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => moveTo(zone.entry)}
                    className={cn("campus-lobby-wing-button", isActive && "campus-lobby-wing-button-active")}
                  >
                    <span className="campus-lobby-wing-icon">
                      <zone.Icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{zone.title}</span>
                      <span className="campus-lobby-wing-button-hint">{zone.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
