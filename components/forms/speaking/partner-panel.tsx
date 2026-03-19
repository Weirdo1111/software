import { Bot, LoaderCircle } from "lucide-react";

import type { PartnerMessage } from "@/components/forms/speaking/types";

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
  return (
    <div className="rounded-[1.6rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(248,250,252,0.86)] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 text-[var(--ink)]">
        <div className="flex items-start gap-3">
          <Bot className="mt-0.5 size-4" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">AI speaking partner</p>
            <p className="mt-3 text-lg font-semibold text-[var(--ink)]">Use one or two turns to test your answer.</p>
          </div>
        </div>
        <span className="rounded-full bg-[rgba(20,50,75,0.05)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
          Optional
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">Each turn is added to the transcript so you can refine it before scoring.</p>

      <div className="mt-5 grid min-h-56 max-h-72 gap-3 overflow-y-auto rounded-[1.25rem] border border-[rgba(20,50,75,0.1)] bg-white/80 p-4">
        {partnerMessages.length > 0 ? (
          partnerMessages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`rounded-[1rem] px-4 py-3 text-sm leading-6 whitespace-pre-line ${
                message.role === "user"
                  ? "bg-[rgba(20,50,75,0.08)] text-[var(--ink)]"
                  : "bg-[rgba(247,239,227,0.92)] text-[var(--ink-soft)]"
              }`}
            >
              {message.content}
            </div>
          ))
        ) : (
          <div className="rounded-[1rem] bg-[rgba(20,50,75,0.04)] px-4 py-3 text-sm leading-6 text-[var(--ink-soft)]">
            Start with one short answer. The AI partner will reply and ask one follow-up question.
          </div>
        )}
      </div>

      <label className="mt-4 grid gap-2 text-sm font-medium text-[var(--ink)]">
        Your next turn
        <textarea
          value={partnerTurn}
          onChange={(event) => onPartnerTurnChange(event.target.value)}
          placeholder="Type the next thing you would say aloud."
          className="min-h-28 rounded-[1.25rem] border border-[rgba(20,50,75,0.16)] bg-white/82 px-4 py-3 text-sm leading-7 outline-none"
        />
      </label>

      <button
        type="button"
        onClick={onPartnerSubmit}
        disabled={isPartnerSubmitting || partnerTurn.trim().length < 6}
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isPartnerSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <Bot className="size-4" />}
        {isPartnerSubmitting ? "AI partner is replying..." : "Practice with AI partner"}
      </button>

      {partnerStatus ? (
        <p className="mt-4 rounded-[1rem] bg-[rgba(255,244,240,0.9)] px-4 py-3 text-sm font-medium text-[var(--coral)]">
          {partnerStatus}
        </p>
      ) : null}

      {partnerNote ? (
        <div className="mt-4 rounded-[1rem] bg-[rgba(237,245,251,0.92)] px-4 py-3 text-sm leading-6 text-[var(--ink-soft)]">
          <p className="font-semibold text-[var(--ink)]">Coach note</p>
          <p className="mt-1">{partnerNote}</p>
        </div>
      ) : null}
    </div>
  );
}
