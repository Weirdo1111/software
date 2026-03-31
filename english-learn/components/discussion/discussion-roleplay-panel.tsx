"use client";

import { type KeyboardEvent, useState } from "react";
import { Bot, Mic, RotateCcw, SendHorizontal, Sparkles, Waves } from "lucide-react";

import type { Locale } from "@/components/discussion/types";
import { useRealtimeRoleplay } from "@/components/discussion/use-realtime-roleplay";
import {
  getRoleplayCharacter,
  listRoleplayCharacters,
  type RoleplayCharacterId,
} from "@/lib/roleplay";

export function DiscussionRoleplayPanel({ locale }: { locale: Locale }) {
  const [selectedCharacterId, setSelectedCharacterId] =
    useState<RoleplayCharacterId>("wizard_boy");
  const [textTurn, setTextTurn] = useState("");
  const character = getRoleplayCharacter(selectedCharacterId);
  const characters = listRoleplayCharacters();
  const bridgeUrl =
    process.env.NEXT_PUBLIC_ROLEPLAY_BRIDGE_URL ||
    (typeof window !== "undefined"
      ? `ws://${window.location.hostname || "127.0.0.1"}:8876`
      : "ws://127.0.0.1:8876");
  const realtime = useRealtimeRoleplay(bridgeUrl);

  const text = {
    zh: {
      badge: "\u4eba\u673a\u626e\u6f14\u5bf9\u8bdd",
      title: "\u8fdb\u5165\u5b9e\u65f6\u82f1\u8bed\u89d2\u8272\u5bf9\u8bdd",
      subtitle:
        "\u8fd9\u4e2a\u9762\u677f\u8d70\u7684\u662f\u539f\u59cb\u5b9e\u65f6\u8bed\u97f3\u94fe\u8def\uff1a16k PCM \u9ea6\u514b\u98ce\u4e0a\u884c\uff0c24k PCM \u89d2\u8272 TTS \u4e0b\u884c\u3002",
      characterCard: "\u89d2\u8272\u8bbe\u5b9a",
      characterSelect: "\u9009\u62e9\u89d2\u8272",
      characterSwitchHint:
        "\u5207\u6362\u89d2\u8272\u4f1a\u65ad\u5f00\u5f53\u524d\u4f1a\u8bdd\uff0c\u518d\u6309\u65b0\u89d2\u8272\u91cd\u65b0\u8fde\u63a5\u3002",
      sceneCard: "\u5b9e\u65f6\u94fe\u8def",
      languageRule:
        "\u4fdd\u7559\u89d2\u8272 speaker \u548c\u5b9e\u65f6\u53c2\u6570\uff0c\u7ee7\u7eed\u8d70\u4f60\u7ed9\u7684\u5b9e\u65f6\u670d\u52a1\u94fe\u8def\u3002",
      reset: "\u65ad\u5f00\u5e76\u6e05\u7a7a",
      connection: "\u8fde\u63a5\u5b9e\u65f6\u4f1a\u8bdd",
      disconnect: "\u7ed3\u675f\u5b9e\u65f6\u4f1a\u8bdd",
      startMic: "\u5f00\u59cb\u9ea6\u514b\u98ce\u4e0a\u884c",
      stopMic: "\u505c\u6b62\u9ea6\u514b\u98ce",
      bridgeCard: "\u672c\u5730 Bridge",
      bridgeOffline:
        "\u5982\u679c\u8fde\u4e0d\u4e0a\uff0c\u5148\u5728\u9879\u76ee\u6839\u76ee\u5f55\u542f\u52a8 `npm run roleplay:bridge:bg`\u3002",
      micLive: "\u9ea6\u514b\u98ce\u6b63\u5728\u5b9e\u65f6\u4e0a\u884c",
      micIdle: "\u9ea6\u514b\u98ce\u5f85\u673a",
      assistantLive: "\u6b63\u5728\u5b9e\u65f6\u8bf4\u8bdd",
      assistantIdle: "\u7b49\u5f85\u4f60\u5f00\u53e3",
      textLabel: "\u53ef\u9009\u6587\u672c\u63d2\u8bdd",
      textPlaceholder:
        "\u67d0\u4e00\u8f6e\u4e0d\u60f3\u5f00\u53e3\u65f6\uff0c\u4e5f\u53ef\u4ee5\u5728\u8fd9\u91cc\u53d1\u4e00\u53e5\u6587\u672c\u3002",
      send: "\u53d1\u9001\u6587\u672c",
      protocolTitle: "\u4fdd\u7559\u7684\u539f\u59cb\u53c2\u6570",
      eventTitle: "\u5b9e\u65f6\u4e8b\u4ef6",
      noEvents: "\u8fde\u63a5\u540e\uff0c\u8fd9\u91cc\u4f1a\u663e\u793a\u4f1a\u8bdd\u72b6\u6001\u548c\u6253\u65ad\u4e8b\u4ef6\u3002",
      bridgeUrl: "\u8fde\u63a5\u5730\u5740",
      variantLabel: "\u6a21\u578b\u7248\u672c",
      resourceLabel: "\u8d44\u6e90 ID",
      speakerLabel: "\u97f3\u8272",
      sampleRate: "\u91c7\u6837\u7387",
      logId: "Log ID",
      statusLabel: "\u8fde\u63a5\u72b6\u6001",
      codebreakerOption: "\u5bc6\u7801\u5b66\u5bb6\uff08\u56fe\u7075\u98ce\u683c\uff09",
      popStarOption: "\u6d41\u884c\u661f\u5149\u5bfc\u5e08 Nova",
      pronunciationTeacherOption: "\u4e13\u4e1a\u82f1\u8bed\u8001\u5e08 Dr. Claire",
    },
    en: {
      badge: "Roleplay Chat",
      title: "Step into a true realtime English roleplay",
      subtitle:
        "This panel follows the original realtime voice path: 16 kHz PCM microphone upstream and 24 kHz PCM character TTS downstream.",
      characterCard: "Character",
      characterSelect: "Choose character",
      characterSwitchHint:
        "Changing character disconnects the current session so the next connection uses the new prompt set.",
      sceneCard: "Realtime link",
      languageRule:
        "The original speaker and role parameters are preserved, and the panel stays on the realtime service path.",
      reset: "Disconnect and clear",
      connection: "Connect realtime session",
      disconnect: "End realtime session",
      startMic: "Start microphone",
      stopMic: "Stop microphone",
      bridgeCard: "Local bridge",
      bridgeOffline:
        "If the panel cannot connect, start `npm run roleplay:bridge:bg` from the project root first.",
      micLive: "Microphone is streaming live",
      micIdle: "Microphone is idle",
      assistantLive: "is speaking in realtime",
      assistantIdle: "is waiting for you",
      textLabel: "Optional text turn",
      textPlaceholder: "If you do not want to speak for one turn, send a text line here.",
      send: "Send text",
      protocolTitle: "Preserved original parameters",
      eventTitle: "Realtime events",
      noEvents: "Session and interruption events will appear here after the bridge connects.",
      bridgeUrl: "Bridge URL",
      variantLabel: "Variant",
      resourceLabel: "Resource ID",
      speakerLabel: "Speaker",
      sampleRate: "Sample rates",
      logId: "Log ID",
      statusLabel: "Connection",
      codebreakerOption: "Codebreaker (Turing-inspired)",
      popStarOption: "Nova (Pop Star Mentor)",
      pronunciationTeacherOption: "Dr. Claire (English Teacher)",
    },
  }[locale];

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
    if (nextCharacterId === selectedCharacterId) {
      return;
    }

    await realtime.disconnectSession();
    realtime.clearLogs();
    setTextTurn("");
    setSelectedCharacterId(nextCharacterId);
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <section className="rounded-[2rem] border border-[#dbe5f4] bg-white/90 p-6 shadow-sm">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#2452a8]">
                <Sparkles className="size-3.5" />
                {text.badge}
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
                {text.title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text.subtitle}</p>
              <button
                type="button"
                onClick={() => void handleReset()}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                <RotateCcw className="size-4" />
                {text.reset}
              </button>
            </section>

            <section className="rounded-[2rem] border border-[#dbe5f4] bg-white/90 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {text.characterCard}
              </p>
              <div className="mt-4 flex items-start gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <Bot className="size-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{character.botName}</p>
                  <p className="text-sm text-slate-500">{character.title}</p>
                </div>
              </div>
              <label className="mt-4 grid gap-2 text-sm font-medium text-slate-800">
                {text.characterSelect}
                <select
                  value={selectedCharacterId}
                  onChange={(event) =>
                    void handleCharacterChange(event.target.value as RoleplayCharacterId)
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                >
                  {characters.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.id === "british_codebreaker"
                        ? text.codebreakerOption
                        : profile.id === "pop_star_mentor"
                          ? text.popStarOption
                          : profile.id === "pronunciation_teacher"
                            ? text.pronunciationTeacherOption
                            : profile.shortLabel}
                    </option>
                  ))}
                </select>
              </label>
              <p className="mt-3 text-xs leading-5 text-slate-500">{text.characterSwitchHint}</p>
              <p className="mt-4 rounded-2xl bg-[#f6f8fc] px-4 py-3 text-sm leading-6 text-slate-600">
                {text.languageRule}
              </p>
              <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                <div className="flex items-start justify-between gap-4">
                  <dt className="font-semibold text-slate-900">{text.speakerLabel}</dt>
                  <dd className="text-right">{character.speaker}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="font-semibold text-slate-900">{text.sampleRate}</dt>
                  <dd className="text-right">
                    {character.inputSampleRate / 1000}k in / {character.outputSampleRate / 1000}k out
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-[2rem] border border-[#dbe5f4] bg-white/90 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {text.sceneCard}
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-600">{character.scene}</p>
              <div className="mt-4 rounded-2xl bg-[#f6f8fc] px-4 py-3 text-sm leading-6 text-slate-600">
                <p className="font-semibold text-slate-900">{text.bridgeCard}</p>
                <p className="mt-2 break-all">{bridgeUrl}</p>
                <p className="mt-3">{text.bridgeOffline}</p>
              </div>
            </section>
          </aside>

          <main className="rounded-[2rem] border border-[#dbe5f4] bg-white/90 p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {text.statusLabel}
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {realtime.status || (realtime.connectionState === "connected" ? "Ready" : "Idle")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void realtime.connectSession(selectedCharacterId)}
                  disabled={
                    realtime.connectionState === "connecting" || realtime.connectionState === "connected"
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Waves className="size-4" />
                  {text.connection}
                </button>
                <button
                  type="button"
                  onClick={() => void realtime.disconnectSession()}
                  disabled={realtime.connectionState !== "connected"}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <RotateCcw className="size-4" />
                  {text.disconnect}
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <section className="rounded-[1.6rem] border border-slate-100 bg-[#f7f9fc] p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <article className="rounded-[1.2rem] border border-slate-100 bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Microphone
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {realtime.isMicActive ? text.micLive : text.micIdle}
                    </p>
                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#2f7cf6] transition-[width] duration-100"
                        style={{ width: `${Math.max(4, Math.round(realtime.audioLevel * 100))}%` }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        void (realtime.isMicActive
                          ? realtime.stopMicrophone()
                          : realtime.startMicrophone())
                      }
                      disabled={realtime.connectionState !== "connected"}
                      className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45 ${
                        realtime.isMicActive
                          ? "border border-[#d95f50] bg-[#c74435] text-white"
                          : "border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      <Mic className={`size-4 ${realtime.isMicActive ? "animate-pulse" : ""}`} />
                      {realtime.isMicActive ? text.stopMic : text.startMic}
                    </button>
                  </article>

                  <article className="rounded-[1.2rem] border border-slate-100 bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {realtime.botName || character.botName}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {realtime.isAssistantSpeaking
                        ? `${realtime.botName || character.botName} ${text.assistantLive}`
                        : `${realtime.botName || character.botName} ${text.assistantIdle}`}
                    </p>
                    <dl className="mt-4 grid gap-2 text-sm text-slate-600">
                      <div className="flex items-start justify-between gap-3">
                        <dt className="font-semibold text-slate-900">{text.speakerLabel}</dt>
                        <dd className="text-right">{realtime.speaker || character.speaker}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <dt className="font-semibold text-slate-900">{text.variantLabel}</dt>
                        <dd className="text-right">{realtime.dialogVariant || "-"}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <dt className="font-semibold text-slate-900">{text.resourceLabel}</dt>
                        <dd className="break-all text-right text-xs">{realtime.resourceId || "-"}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <dt className="font-semibold text-slate-900">{text.logId}</dt>
                        <dd className="break-all text-right text-xs">{realtime.logId || "-"}</dd>
                      </div>
                    </dl>
                  </article>
                </div>

                <label className="mt-4 grid gap-2 text-sm font-medium text-slate-800">
                  {text.textLabel}
                  <textarea
                    value={textTurn}
                    onChange={(event) => setTextTurn(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={text.textPlaceholder}
                    className="min-h-24 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-sm leading-7 outline-none"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => void handleTextSubmit()}
                  disabled={realtime.connectionState !== "connected" || textTurn.trim().length === 0}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <SendHorizontal className="size-4" />
                  {text.send}
                </button>
              </section>

              <aside className="rounded-[1.6rem] border border-slate-100 bg-[#f7f9fc] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {text.protocolTitle}
                </p>
                <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="font-semibold text-slate-900">{text.bridgeUrl}</dt>
                    <dd className="break-all text-right">{bridgeUrl}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="font-semibold text-slate-900">{text.variantLabel}</dt>
                    <dd className="text-right">{realtime.dialogVariant || "-"}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="font-semibold text-slate-900">{text.resourceLabel}</dt>
                    <dd className="break-all text-right text-xs">{realtime.resourceId || "-"}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="font-semibold text-slate-900">{text.speakerLabel}</dt>
                    <dd className="text-right">{character.speaker}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="font-semibold text-slate-900">{text.sampleRate}</dt>
                    <dd className="text-right">
                      {character.inputSampleRate / 1000}k / {character.outputSampleRate / 1000}k
                    </dd>
                  </div>
                </dl>
              </aside>
            </div>

            {realtime.status ? (
              <p className="mt-4 rounded-[1rem] bg-[#fff4f0] px-4 py-3 text-sm font-medium text-[#cc5c45]">
                {realtime.status}
              </p>
            ) : null}

            <section className="mt-4 rounded-[1.6rem] border border-slate-100 bg-[#f7f9fc] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {text.eventTitle}
              </p>
              <div className="mt-4 grid gap-3">
                {realtime.logs.length > 0 ? (
                  realtime.logs.map((entry) => (
                    <div
                      key={entry.id}
                      className={`rounded-[1rem] px-4 py-3 text-sm leading-6 ${
                        entry.tone === "error"
                          ? "bg-[#fff4f0] text-[#b24734]"
                          : entry.tone === "warn"
                            ? "bg-[#fff8e7] text-[#8d5a21]"
                            : entry.tone === "success"
                              ? "bg-[#edf7f1] text-[#285f4d]"
                              : "bg-white text-slate-600"
                      }`}
                    >
                      {entry.message}
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1rem] bg-white px-4 py-3 text-sm leading-6 text-slate-500">
                    {text.noEvents}
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
