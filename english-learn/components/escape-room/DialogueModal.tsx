"use client";

import { useState } from "react";
import { Lightbulb, MessageSquareQuote, Send } from "lucide-react";

import { resolveDialogueTurn } from "@/components/escape-room/dialogue-rules";
import { ModalShell } from "@/components/escape-room/ModalShell";
import type { DialogueTurn } from "@/components/escape-room/types";

const starterTurns: DialogueTurn[] = [
  {
    id: "intro-librarian",
    role: "librarian",
    content: "The AI librarian is online. Ask for help in English. Polite requests work best.",
  },
];

const promptSuggestions = [
  "Could you give me a hint, please?",
  "Can you help me with the exit code, please?",
  "Could you help me understand the clues from the shelf and notice board?",
];

export function DialogueModal({
  completed,
  onSolved,
  onClose,
}: {
  completed: boolean;
  onSolved: () => void;
  onClose: () => void;
}) {
  const [turns, setTurns] = useState<DialogueTurn[]>(starterTurns);
  const [input, setInput] = useState("");
  const [solvedThisRound, setSolvedThisRound] = useState(false);

  const submitTurn = (text: string) => {
    const trimmed = text.trim();

    if (!trimmed) {
      return;
    }

    const resolved = resolveDialogueTurn(trimmed);

    setTurns((currentTurns) => [
      ...currentTurns,
      {
        id: `player-${currentTurns.length}`,
        role: "player",
        content: trimmed,
      },
      {
        id: `librarian-${currentTurns.length}`,
        role: "librarian",
        content: resolved.reply,
        intent: resolved.intent,
      },
    ]);
    setInput("");

    if (resolved.solved) {
      setSolvedThisRound(true);
    }
  };

  return (
    <ModalShell title="AI Librarian Terminal" subtitle="Ask the librarian for help in polite English." onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/52 p-5">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="size-4 text-cyan-200" />
            <p className="text-sm font-semibold tracking-tight text-white">Library chat</p>
          </div>

          <div className="mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-1">
            {turns.map((turn) => (
              <div key={turn.id} className={`flex ${turn.role === "player" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-[1.25rem] px-4 py-3 text-sm leading-6 shadow-sm ${
                    turn.role === "player" ? "bg-cyan-400/16 text-cyan-50" : "border border-white/10 bg-white/8 text-slate-100"
                  }`}
                >
                  {turn.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/52 p-5">
          <p className="text-sm font-semibold tracking-tight text-white">Try one of these prompts</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {promptSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setInput(suggestion)}
                className="rounded-full border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-slate-100 transition hover:border-cyan-300/30 hover:bg-cyan-300/10"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form
            className="mt-4 flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              submitTurn(input);
            }}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={3}
              placeholder="Type one sentence in English..."
              className="w-full rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-400">Try a polite request that refers to the shelf, notice board, or exit clue order.</p>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:translate-y-[-1px]"
              >
                <Send className="size-4" />
                Send
              </button>
            </div>
          </form>
        </div>

        {completed || solvedThisRound ? (
          <div className="rounded-[1.5rem] border border-emerald-300/35 bg-emerald-400/10 p-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="mt-0.5 size-4 text-emerald-300" />
              <div>
                <p className="text-sm font-semibold tracking-tight text-emerald-100">Dialogue goal reached</p>
                <p className="mt-1 text-sm leading-6 text-emerald-100">
                  The librarian confirmed the clue order. Continue to the etiquette quiz to finish the access check.
                </p>
              </div>
            </div>

            {!completed ? (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={onSolved}
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:translate-y-[-1px]"
                >
                  Continue to quiz
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </ModalShell>
  );
}
