"use client";

// AI-assisted authorship note: this interactive lobby layout and movement flow
// were initially drafted with AI assistance and then adjusted by the team.

import { useRouter } from "next/navigation";
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
  buddyVariant,
  buddyOutfit,
}: {
  locale: Locale;
  levelPrefix: string;
  nextQuestHref: string;
  buddyStage: BuddyStage;
  buddyFocus: BuddyFocus;
  buddyVariant?: BuddyVariant;
  buddyOutfit: BuddyOutfit;
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
  const facingRef = useRef<"left" | "right">("right");

  const [position, setPosition] = useState(START_POSITION);
  const [arenaSize, setArenaSize] = useState({ width: 0, height: 0 });
  const [keyboardEnabled, setKeyboardEnabled] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [facing, setFacing] = useState<"left" | "right">("right");

  const clearDirections = useEffectEvent(() => {
    keysRef.current.up = false;
    keysRef.current.down = false;
    keysRef.current.left = false;
    keysRef.current.right = false;
  });

  const zones = useMemo<LobbyZone[]>(
    () => [
      {
        id: "challenge-zone",
        title: locale === "zh" ? "闯关区" : "Challenge",
        note: locale === "zh" ? "进入随机听力测试与挑战模式。" : "Enter the listening test challenge.",
        hint: locale === "zh" ? "随机测试" : "Listening test",
        href: `/challenge?lang=${locale}`,
        x: 0.03,
        y: 0.18,
        width: 0.17,
        height: 0.17,
        entry: { x: 0.115, y: 0.37 },
        gradient: ["#ffb88a", "#ff8ea0"],
        Icon: Compass,
      },
      {
        id: "task-hub",
        title: locale === "zh" ? "任务站" : "Task Hub",
        note: locale === "zh" ? "查看每日任务与学习计划。" : "Open daily tasks and your study plan.",
        hint: locale === "zh" ? "今日任务" : "Daily tasks",
        href: nextQuestHref,
        x: 0.22,
        y: 0.18,
        width: 0.17,
        height: 0.17,
        entry: { x: 0.305, y: 0.37 },
        gradient: ["#ffc892", "#ffd4a8"],
        Icon: Target,
      },
      {
        id: "listening-hall",
        title: locale === "zh" ? "听力馆" : "Listening",
        note: locale === "zh" ? "TED、公开讲座与课堂听力入口。" : "TED talks, lectures, and listening practice.",
        hint: locale === "zh" ? "TED + 讲座" : "TED + lectures",
        href: `/listening?lang=${locale}`,
        x: 0.41,
        y: 0.16,
        width: 0.18,
        height: 0.19,
        entry: { x: 0.5, y: 0.37 },
        gradient: ["#69c8ff", "#78e5d0"],
        Icon: Headphones,
      },
      {
        id: "speaking-lab",
        title: locale === "zh" ? "口语舱" : "Speaking",
        note: locale === "zh" ? "课堂回答与场景口语训练。" : "Practice speaking for class and seminar scenes.",
        hint: locale === "zh" ? "课堂表达" : "Class speaking",
        href: `/lesson/${levelPrefix}-speaking-starter?lang=${locale}`,
        x: 0.61,
        y: 0.18,
        width: 0.17,
        height: 0.17,
        entry: { x: 0.695, y: 0.37 },
        gradient: ["#ffc77d", "#ff9db0"],
        Icon: Mic,
      },
      {
        id: "reading-island",
        title: locale === "zh" ? "阅读岛" : "Reading",
        note: locale === "zh" ? "进行学术阅读与理解训练。" : "Train academic reading and comprehension.",
        hint: locale === "zh" ? "文献精读" : "Text analysis",
        href: `/reading?lang=${locale}`,
        x: 0.8,
        y: 0.18,
        width: 0.17,
        height: 0.17,
        entry: { x: 0.885, y: 0.37 },
        gradient: ["#a8df9a", "#7ec7ff"],
        Icon: LibraryBig,
      },
      {
        id: "writing-studio",
        title: locale === "zh" ? "写作坊" : "Writing",
        note: locale === "zh" ? "进入写作任务与段落训练。" : "Open writing tasks and paragraph training.",
        hint: locale === "zh" ? "段落训练" : "Paragraph work",
        href: `/lesson/${levelPrefix}-writing-starter?lang=${locale}`,
        x: 0.03,
        y: 0.62,
        width: 0.17,
        height: 0.17,
        entry: { x: 0.115, y: 0.78 },
        gradient: ["#ffe2a8", "#ffb8a1"],
        Icon: PenLine,
      },
      {
        id: "ai-coach",
        title: locale === "zh" ? "AI陪练" : "AI Coach",
        note: locale === "zh" ? "与 AI 角色对话并获取即时反馈。" : "Roleplay with AI and get instant feedback.",
        hint: locale === "zh" ? "角色对话" : "Roleplay chat",
        href: `/discussion/roleplay?lang=${locale}`,
        x: 0.22,
        y: 0.62,
        width: 0.17,
        height: 0.17,
        entry: { x: 0.305, y: 0.78 },
        gradient: ["#e3d6ff", "#bfe6ff"],
        Icon: Sparkles,
      },
      {
        id: "seminar-room",
        title: locale === "zh" ? "研讨室" : "Seminars",
        note: locale === "zh" ? "加入主题研讨与协作互动。" : "Join topic seminars and collaboration rooms.",
        hint: locale === "zh" ? "主题研讨" : "Topic rooms",
        href: `/discussion/seminars?lang=${locale}`,
        x: 0.41,
        y: 0.62,
        width: 0.18,
        height: 0.17,
        entry: { x: 0.5, y: 0.78 },
        gradient: ["#b9d7ff", "#eadcff"],
        Icon: Glasses,
      },
      {
        id: "discussion-zone",
        title: locale === "zh" ? "讨论区" : "Discussion",
        note: locale === "zh" ? "提问、交流、分享学习资源。" : "Ask, share, and discuss with peers.",
        hint: locale === "zh" ? "交流互助" : "Peer exchange",
        href: `/discussion?lang=${locale}`,
        x: 0.61,
        y: 0.62,
        width: 0.17,
        height: 0.17,
        entry: { x: 0.695, y: 0.78 },
        gradient: ["#9fd76f", "#69d4c1"],
        Icon: MessageSquareMore,
      },
      {
        id: "game-center",
        title: locale === "zh" ? "游戏区" : "Games",
        note: locale === "zh" ? "通过小游戏巩固词汇与表达。" : "Practice vocabulary and expression in games.",
        hint: locale === "zh" ? "闯关小游戏" : "Mini games",
        href: `/games?lang=${locale}`,
        x: 0.8,
        y: 0.62,
        width: 0.17,
        height: 0.17,
        entry: { x: 0.885, y: 0.78 },
        gradient: ["#ffd36f", "#ff9c8f"],
        Icon: Gamepad2,
      },
    ],
    [levelPrefix, locale, nextQuestHref],
  );
  const primaryBuddyVariant = buddyVariant ?? getBuddyVariantFromFocus(buddyFocus);

  const activeZone = useMemo(() => {
    if (arenaSize.width <= 0 || arenaSize.height <= 0) return null;

    const petX = position.x * arenaSize.width;
    const petY = position.y * arenaSize.height;
    const activationDistance = Math.max(48, Math.min(110, Math.min(arenaSize.width, arenaSize.height) * 0.1));

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
        const nextFacing = next.x < current.x ? "left" : next.x > current.x ? "right" : facingRef.current;
        if (nextFacing !== facingRef.current) {
          facingRef.current = nextFacing;
          setFacing(nextFacing);
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

  return (
    <article className="campus-card bg-[linear-gradient(165deg,rgba(255,255,255,0.99),rgba(245,249,255,0.95),rgba(255,244,250,0.92))] p-6">
      <div>
        <div>
          <p className="section-label">
            <Compass className="size-3.5" />
            {locale === "zh" ? "互动大厅" : "Interactive Lobby"}
          </p>
          <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
            {locale === "zh" ? "学习广场" : "Study Plaza"}
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ink-soft)]">
            {locale === "zh"
              ? "学习广场地图已扩展为 10 个功能分区。移动桌宠靠近任意分区建筑，就能直接进入对应模块。"
              : "The study map now has 10 functional zones. Move your buddy near any zone building to enter that module."}
          </p>
        </div>
      </div>

      <div className="mt-6">
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
                <span className="campus-lobby-zone-title text-sm font-semibold text-[var(--ink)]">{zone.title}</span>
                <span className="campus-lobby-zone-hint mt-1 text-xs leading-5 text-[var(--ink-soft)]">{zone.hint}</span>
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
            <span className="campus-lobby-pet-body">
              <BuddyCompanion
                stage={buddyStage}
                focus={buddyFocus}
                mood={activeZone ? "proud" : "happy"}
                variant={primaryBuddyVariant}
                outfit={buddyOutfit}
                float={false}
                className="relative z-10 w-[4.8rem] max-w-[4.8rem] drop-shadow-[0_18px_22px_rgba(63,85,129,0.16)]"
              />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
