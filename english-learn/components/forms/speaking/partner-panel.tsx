import { Bot, LoaderCircle, Mic, SendHorizontal, Square, Volume2 } from "lucide-react";
import { type KeyboardEvent } from "react";

import { useShadowingPractice } from "@/components/forms/listening/use-shadowing-practice";
import type { PartnerMessage } from "@/components/forms/speaking/types";
import { useBrowserSpeech } from "@/components/forms/speaking/use-browser-speech";
import { cn } from "@/lib/utils";

// Date: 2026/3/18
// Author: Tianbo Cao
// Reduced the partner panel to an optional rehearsal step between recording and scoring.
export function SpeakingPartnerPanel({
  partnerMessages,
  partnerTurn,
  partnerStatus,
  partnerNote,
  isPartnerSubmitting,
  onPartnerTurnChange,
  onPartnerSubmit,
}: {
  partnerMessages: PartnerMessage[];
  partnerTurn: string;
  partnerStatus: string;
  partnerNote: string;
  isPartnerSubmitting: boolean;
  onPartnerTurnChange: (value: string) => void;
  onPartnerSubmit: () => void;
}) {
  const { playingId, playbackStatus, playMessage, stopPlayback } = useBrowserSpeech();
  const {
    isSupported: isShadowingSupported,
    status: shadowingStatus,
    error: shadowingError,
    audioLevel: shadowingAudioLevel,
    startListening,
    stopListening,
    resetListening,
  } = useShadowingPractice();
  const canSubmit = partnerTurn.trim().length >= 6 && !isPartnerSubmitting;
  const micClassName =
    shadowingStatus === "listening" ? "size-4 text-white animate-pulse" : "size-4 text-[rgba(20,50,75,0.42)]";

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handlePartnerSubmit();
    }
  }

  function handlePartnerSubmit() {
    if (shadowingStatus === "listening") {
      stopListening();
    }

    resetListening();
    onPartnerSubmit();
  }

  function handleVoiceInput() {
    if (shadowingStatus === "listening") {
      stopListening();
      return;
    }

    startListening("en-GB", {
      initialText: partnerTurn,
      continuous: true,
      fallbackLocale: "en-US",
      stopOnSilence: false,
      onTranscriptChange: onPartnerTurnChange,
    });
  }

  return (
    <div className="rounded-[1.6rem] border border-[rgba(20,50,75,0.12)] bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 text-[var(--ink)]">
        <div className="flex items-start gap-3">
          <Bot className="mt-0.5 size-4" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">AI speaking partner</p>
            <p className="mt-3 text-lg font-semibold text-[var(--ink)]">Chat freely in English about anything you want.</p>
          </div>
        </div>
        <span className="rounded-full bg-[rgba(20,50,75,0.05)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
          Optional
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">Press Enter to send. Press Shift + Enter for a new line.</p>

      <div className="mt-5 grid min-h-56 max-h-72 gap-3 overflow-y-auto rounded-[1.25rem] border border-[rgba(20,50,75,0.1)] bg-[#f7f8fa] p-4">
        {partnerMessages.length > 0 ? (
          partnerMessages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[78%] rounded-[1.2rem] px-4 py-3 text-sm leading-6 whitespace-pre-line shadow-sm ${
                  message.role === "user"
                    ? "bg-[#2f7cf6] text-white"
                    : "border border-[rgba(20,50,75,0.08)] bg-white text-[var(--ink)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.16em] ${
                      message.role === "user" ? "text-white/75" : "text-[var(--ink-soft)]"
                    }`}
                  >
                    {message.role === "user" ? "You" : "AI partner"}
                  </p>
                  {message.role === "assistant" ? (
                    playingId === `${message.role}-${index}` ? (
                      <button
                        type="button"
                        onClick={stopPlayback}
                        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[rgba(20,50,75,0.12)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)]"
                      >
                        <Square className="size-3.5" /> Stop
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => playMessage(`${message.role}-${index}`, message.content)}
                        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[rgba(20,50,75,0.12)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)]"
                      >
                        <Volume2 className="size-3.5" /> Play
                      </button>
                    )
                  ) : null}
                </div>
                <p className="mt-2">{message.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[1rem] border border-[rgba(20,50,75,0.08)] bg-white px-4 py-3 text-sm leading-6 text-[var(--ink-soft)]">
            Start with any short message. The AI partner will reply and keep the conversation going.
          </div>
        )}
        {isPartnerSubmitting ? (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-[1.2rem] border border-[rgba(20,50,75,0.08)] bg-white px-4 py-3 text-sm text-[var(--ink-soft)] shadow-sm">
              <LoaderCircle className="size-4 animate-spin" />
              AI partner is typing...
            </div>
          </div>
        ) : null}
      </div>

      <label className="mt-4 grid gap-2 text-sm font-medium text-[var(--ink)]">
        Your message
        <textarea
          value={partnerTurn}
          onChange={(event) => onPartnerTurnChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type the next thing you would say aloud."
          className="min-h-24 rounded-[1.25rem] border border-[rgba(20,50,75,0.16)] bg-white px-4 py-3 text-sm leading-7 outline-none"
        />
      </label>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleVoiceInput}
          disabled={!isShadowingSupported}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45",
            shadowingStatus === "listening"
              ? "border border-[#e25d4b] bg-[#c74435] text-white shadow-[0_10px_24px_rgba(199,68,53,0.2)]"
              : "border border-[rgba(20,50,75,0.12)] bg-white text-[var(--ink)]",
          )}
        >
          <Mic className={micClassName} />
          {shadowingStatus === "listening" ? "Stop recording" : "Voice input"}
        </button>
        <div className="flex items-center gap-3 rounded-full border border-[rgba(20,50,75,0.12)] bg-white px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">dB</span>
          <div className="h-2.5 w-28 overflow-hidden rounded-full bg-[rgba(20,50,75,0.08)]">
            <div
              className="h-full rounded-full bg-[#2f7cf6] transition-[width] duration-100"
              style={{ width: `${Math.max(4, Math.round(shadowingAudioLevel * 100))}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handlePartnerSubmit}
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 rounded-full bg-[#2f7cf6] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isPartnerSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <SendHorizontal className="size-4" />}
          Send
        </button>
      </div>
      {partnerTurn.trim().length > 0 && partnerTurn.trim().length < 6 ? (
        <p className="text-sm font-medium text-[var(--coral)]">Please enter at least 6 characters before continuing.</p>
      ) : (
        <p className="text-sm text-[var(--ink-soft)]">Speak into the microphone and your words will appear directly in this chat box.</p>
      )}

      {partnerStatus ? (
        <p className="mt-4 rounded-[1rem] bg-[#fff4f0] px-4 py-3 text-sm font-medium text-[var(--coral)]">
          {partnerStatus}
        </p>
      ) : null}

      {shadowingStatus === "listening" ? (
        <p className="mt-4 rounded-[1rem] bg-[#fff1ef] px-4 py-3 text-sm font-semibold text-[#b93829]">
          Recording now. Click the red button to stop and keep filling the chat input.
        </p>
      ) : null}

      {shadowingError ? (
        <p className="mt-4 rounded-[1rem] bg-[#fff4f0] px-4 py-3 text-sm font-medium text-[var(--coral)]">
          {shadowingError}
        </p>
      ) : null}

      {playbackStatus ? (
        <p className="mt-4 rounded-[1rem] bg-[#fff4f0] px-4 py-3 text-sm font-medium text-[var(--coral)]">
          {playbackStatus}
        </p>
      ) : null}

      {partnerNote ? (
        <div className="mt-4 rounded-[1rem] bg-[#edf5fb] px-4 py-3 text-sm leading-6 text-[var(--ink-soft)]">
          <p className="font-semibold text-[var(--ink)]">Coach note</p>
          <p className="mt-1">{partnerNote}</p>
        </div>
      ) : null}
    </div>
  );
}
