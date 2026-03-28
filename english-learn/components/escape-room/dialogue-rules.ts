import type { DialogueIntent } from "@/components/escape-room/types";

export function detectDialogueIntent(input: string): DialogueIntent {
  const normalized = input.trim().toLowerCase();
  const asksHint = /(hint|clue)/.test(normalized);
  const polite = hasPoliteRequestSignal(input);

  if (!normalized) {
    return "unrelated";
  }

  if (asksHint && polite) {
    return "ask_for_hint";
  }

  if (/(give me|tell me now|just tell me|answer now)/.test(normalized)) {
    return "impolite_request";
  }

  if (asksHint) {
    return "ask_for_hint";
  }

  if (/(help|please|can you|could you)/.test(normalized)) {
    return "ask_for_help";
  }

  return "unrelated";
}

export function hasPoliteRequestSignal(input: string): boolean {
  return /(please|can you|could you|would you|may i)/.test(input.trim().toLowerCase());
}

export function buildLibrarianReply(intent: DialogueIntent): string {
  switch (intent) {
    case "ask_for_help":
      return "Of course. Start with the history shelf number, then place the closing time right after it.";
    case "ask_for_hint":
      return "Check the bookshelf and the notice board carefully, then compare them with the desk-side support notes.";
    case "impolite_request":
      return "Please ask more politely.";
    default:
      return "Focus on the exit procedure, the shelf marker, and the closing notice.";
  }
}

export function isDialogueSolved(intent: DialogueIntent): boolean {
  return intent === "ask_for_help" || intent === "ask_for_hint";
}

export function resolveDialogueTurn(input: string) {
  const intent = detectDialogueIntent(input);
  const polite = hasPoliteRequestSignal(input);

  if (intent === "ask_for_help" && !polite) {
    return {
      intent,
      reply: "You are asking for help, but try phrasing it more politely.",
      solved: false,
    };
  }

  if (intent === "ask_for_hint" && !polite) {
    return {
      intent,
      reply: "That is close. Add a polite opener such as 'could you' or 'please.'",
      solved: false,
    };
  }

  return {
    intent,
    reply: buildLibrarianReply(intent),
    solved: isDialogueSolved(intent),
  };
}
