"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  GraduationCap,
  Mic,
  RotateCcw,
  SendHorizontal,
  Sparkles,
  Star,
  WandSparkles,
  Waves,
} from "lucide-react";

import type { Locale } from "@/components/discussion/types";
import { useRealtimeRoleplay } from "@/components/discussion/use-realtime-roleplay";
import {
  getRoleplayCharacter,
  listRoleplayCharacters,
  type RoleplayCharacterId,
} from "@/lib/roleplay";

type CharacterVisual = {
  icon: LucideIcon;
  iconWrapClassName: string;
  activeClassName: string;
  bubbleClassName: string;
};

const CHARACTER_VISUALS: Record<RoleplayCharacterId, CharacterVisual> = {
  wizard_boy: {
    icon: WandSparkles,
    iconWrapClassName:
      "bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,214,235,0.92))] text-[#7c2956]",
    activeClassName:
      "bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(255,238,246,0.92))] text-[#7c2956]",
    bubbleClassName: "bg-[#ff99cc] text-[#641745]",
  },
  british_codebreaker: {
    icon: Bot,
    iconWrapClassName:
      "bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(218,238,255,0.94))] text-[#27537e]",
    activeClassName:
      "bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(232,244,255,0.94))] text-[#27537e]",
    bubbleClassName: "bg-[#d9efff] text-[#214d74]",
  },
  pop_star_mentor: {
    icon: Star,
    iconWrapClassName:
      "bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,231,190,0.94))] text-[#855114]",
    activeClassName:
      "bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(255,244,221,0.94))] text-[#855114]",
    bubbleClassName: "bg-[#ffd58c] text-[#694100]",
  },
  pronunciation_teacher: {
    icon: GraduationCap,
    iconWrapClassName:
      "bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(214,247,236,0.94))] text-[#2a6855]",
    activeClassName:
      "bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(231,250,243,0.94))] text-[#2a6855]",
    bubbleClassName: "bg-[#c9f0df] text-[#214f41]",
  },
};

function getConnectionLabel(
  locale: Locale,
  connectionState: "idle" | "connecting" | "connected" | "error",
) {
  if (locale === "zh") {
    if (connectionState === "connected") return "已连接";
    if (connectionState === "connecting") return "连接中";
    if (connectionState === "error") return "连接异常";
    return "待连接";
  }

  if (connectionState === "connected") return "Connected";
  if (connectionState === "connecting") return "Connecting";
  if (connectionState === "error") return "Error";
  return "Idle";
}

function getLogToneClass(tone: "neutral" | "success" | "warn" | "error") {
  if (tone === "success") return "bg-white text-[#285f4d]";
  if (tone === "warn") return "bg-[#fff7e8] text-[#8f6122]";
  if (tone === "error") return "bg-[#fff2f0] text-[#b04d45]";
  return "bg-white text-[#516361]";
}

export function DiscussionRoleplayPanel({ locale }: { locale: Locale }) {
  const [selectedCharacterId, setSelectedCharacterId] =
    useState<RoleplayCharacterId>("wizard_boy");
  const [textTurn, setTextTurn] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const character = getRoleplayCharacter(selectedCharacterId);
  const characters = listRoleplayCharacters();
  const bridgeUrl =
    process.env.NEXT_PUBLIC_ROLEPLAY_BRIDGE_URL ||
    (typeof window !== "undefined"
      ? `ws://${window.location.hostname || "127.0.0.1"}:8877`
      : "ws://127.0.0.1:8877");
  const realtime = useRealtimeRoleplay(bridgeUrl);
  const visual = CHARACTER_VISUALS[selectedCharacterId];
  const CharacterIcon = visual.icon;
  const connectionLabel = getConnectionLabel(locale, realtime.connectionState);
  const latestLogs = [...realtime.logs].slice(-8);

  const text = {
    zh: {
      brand: "Dreamscape AI",
      sideTitle: "Characters",
      sideNote: "Choose your companion",
      newChat: "新会话",
      connect: "连接会话",
      disconnect: "结束会话",
      startMic: "开始说话",
      stopMic: "停止麦克风",
      textPlaceholder: "不想开口时，也可以直接发一句文本。",
      send: "发送",
      waiting: "先连接角色，角色会先说开场白。",
      ready: "实时链路已接通，可以自然开始对话。",
      bridgeHint: "若连接失败，请先启动本地 bridge。",
      statusIdle: "等待你开始",
      statusLive: "正在实时对话",
    },
    en: {
      brand: "Dreamscape AI",
      sideTitle: "Characters",
      sideNote: "Choose your companion",
      newChat: "New Chat",
      connect: "Connect",
      disconnect: "Disconnect",
      startMic: "Start Mic",
      stopMic: "Stop Mic",
      textPlaceholder: "If you do not want to speak for one turn, send a text line here.",
      send: "Send",
      waiting: "Connect first. The character will deliver the opening line.",
      ready: "The realtime link is live. You can start talking naturally.",
      bridgeHint: "If connection fails, start the local bridge first.",
      statusIdle: "Waiting to begin",
      statusLive: "Live conversation",
    },
  }[locale];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [selectedCharacterId, realtime.logs, realtime.status, realtime.connectionState]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleTextSubmit();
    }
  }

  async function handleTextSubmit() {
    const trimmed = textTurn.trim();
    if (!trimmed) return;
    await realtime.sendTextTurn(trimmed);
    setTextTurn("");
  }

  async function handleReset() {
    await realtime.disconnectSession();
    realtime.clearLogs();
    setTextTurn("");
  }

  async function handleCharacterChange(nextCharacterId: RoleplayCharacterId) {
    if (nextCharacterId === selectedCharacterId) return;
    await realtime.disconnectSession();
    realtime.clearLogs();
    setTextTurn("");
    setSelectedCharacterId(nextCharacterId);
  }

  return (
    <div className="h-[calc(100vh-8.5rem)] min-h-[38rem] overflow-hidden rounded-[2.4rem] bg-[#e8faf9] shadow-[0_18px_48px_rgba(34,49,49,0.08)] max-md:h-[calc(100vh-7rem)] max-md:min-h-[34rem]">
      <div className="flex h-full min-h-0 flex-col md:flex-row">
        <aside className="w-full overflow-y-auto bg-[#f2fcfb] p-6 md:w-72 md:shrink-0">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#913e6c]">{text.brand}</h1>
            <p className="mt-1 text-sm text-[#5f7271]">{text.sideNote}</p>
          </div>

          <button
            type="button"
            onClick={() => void handleReset()}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[1.25rem] bg-[linear-gradient(135deg,#913e6c,#ff99cc)] px-4 py-4 text-sm font-bold text-white transition-transform duration-300 hover:scale-[1.03]"
          >
            <RotateCcw className="size-4" />
            {text.newChat}
          </button>

          <div className="mt-6">
            <p className="text-sm font-bold text-[#223131]">{text.sideTitle}</p>
          </div>

          <nav className="mt-4 space-y-3">
            {characters.map((profile) => {
              const profileVisual = CHARACTER_VISUALS[profile.id];
              const ProfileIcon = profileVisual.icon;
              const isActive = profile.id === selectedCharacterId;

              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => void handleCharacterChange(profile.id)}
                  className={`flex w-full items-center gap-3 rounded-[1.4rem] p-3 text-left transition-all ${
                    isActive
                      ? `${profileVisual.activeClassName} shadow-[0_10px_24px_rgba(34,49,49,0.08)]`
                      : "bg-transparent text-[#5f7271] hover:bg-white/70"
                  }`}
                >
                  <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-[1rem] ${profileVisual.iconWrapClassName}`}
                  >
                    <ProfileIcon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm ${isActive ? "font-bold" : "font-medium"}`}>
                      {profile.botName}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 opacity-80">{profile.title}</p>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="relative flex min-h-0 flex-1 flex-col bg-[#d7edec]">
          <div className="pointer-events-none absolute right-8 top-8 text-[#913e6c]/15">
            <Sparkles className="size-14" />
          </div>
          <div className="pointer-events-none absolute bottom-28 left-8 text-[#6eb5ff]/20">
            <Waves className="size-16" />
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-10">
            <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-end">
              <div className="flex flex-col items-center text-center">
              <div
                className={`flex size-28 items-center justify-center rounded-full shadow-[0_18px_40px_rgba(34,49,49,0.12)] ${visual.iconWrapClassName}`}
              >
                <CharacterIcon className="size-12" />
              </div>
              <h2 className="mt-5 text-4xl font-black tracking-tight text-[#223131]">
                {character.botName}
              </h2>
              <p className="mt-3 max-w-2xl text-lg italic text-[#607371]">{character.scene}</p>
              </div>

              <div className="mt-10 flex flex-col gap-4">
                <div className={`max-w-2xl rounded-[1.5rem] rounded-bl-[0.5rem] px-6 py-5 shadow-[0_16px_36px_rgba(34,49,49,0.08)] ${visual.bubbleClassName}`}>
                  <p className="text-base leading-7">{character.hello}</p>
                </div>

                <div className="ml-auto rounded-full bg-white/76 px-4 py-2 text-sm font-bold text-[#4f6261] shadow-[0_10px_22px_rgba(34,49,49,0.05)]">
                  {realtime.connectionState === "connected" ? text.statusLive : text.statusIdle}
                  {" · "}
                  {connectionLabel}
                </div>

                {realtime.status ? (
                  <div className="max-w-2xl rounded-[1.3rem] bg-white px-5 py-4 text-sm leading-6 text-[#516361] shadow-[0_12px_26px_rgba(34,49,49,0.05)]">
                    {realtime.status}
                  </div>
                ) : (
                  <div className="max-w-2xl rounded-[1.3rem] bg-white px-5 py-4 text-sm leading-6 text-[#516361] shadow-[0_12px_26px_rgba(34,49,49,0.05)]">
                    {realtime.connectionState === "connected" ? text.ready : text.waiting}
                  </div>
                )}

                {latestLogs.map((entry) => (
                  <div
                    key={entry.id}
                    className={`max-w-2xl rounded-[1.3rem] px-5 py-4 text-sm leading-6 shadow-[0_12px_26px_rgba(34,49,49,0.05)] ${getLogToneClass(entry.tone)}`}
                  >
                    {entry.message}
                  </div>
                ))}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          <div className="shrink-0 bg-[linear-gradient(180deg,rgba(215,237,236,0),rgba(200,226,225,0.95))] px-6 pb-6 pt-4">
            <div className="mx-auto max-w-3xl rounded-[1.8rem] bg-[#e1f5f4] p-4 shadow-[inset_0_2px_10px_rgba(34,49,49,0.05)]">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void realtime.connectSession(selectedCharacterId)}
                  disabled={
                    realtime.connectionState === "connecting" || realtime.connectionState === "connected"
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#913e6c,#ff99cc)] px-5 py-3 text-sm font-bold text-white transition-transform duration-300 hover:scale-[1.04] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Waves className="size-4" />
                  {text.connect}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void (realtime.isMicActive
                      ? realtime.stopMicrophone()
                      : realtime.startMicrophone())
                  }
                  disabled={realtime.connectionState !== "connected"}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#314645] transition-transform duration-300 hover:scale-[1.04] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Mic className={`size-4 ${realtime.isMicActive ? "animate-pulse" : ""}`} />
                  {realtime.isMicActive ? text.stopMic : text.startMic}
                </button>

                <button
                  type="button"
                  onClick={() => void realtime.disconnectSession()}
                  disabled={realtime.connectionState !== "connected"}
                  className="inline-flex items-center gap-2 rounded-full bg-[#c8e2e1] px-5 py-3 text-sm font-bold text-[#314645] transition-transform duration-300 hover:scale-[1.04] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RotateCcw className="size-4" />
                  {text.disconnect}
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="min-w-0 flex-1">
                  <textarea
                    value={textTurn}
                    onChange={(event) => setTextTurn(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={text.textPlaceholder}
                    className="min-h-24 w-full rounded-[1.4rem] bg-white px-4 py-4 text-sm leading-7 text-[#223131] outline-none placeholder:text-[#7b918f]"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => void handleTextSubmit()}
                  disabled={realtime.connectionState !== "connected" || textTurn.trim().length === 0}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#fad538] px-6 text-sm font-black text-[#5a4a00] transition-transform duration-300 hover:scale-[1.04] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <SendHorizontal className="size-4" />
                  {text.send}
                </button>
              </div>

              <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-[#708583]/80">
                {text.bridgeHint} · {bridgeUrl}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
