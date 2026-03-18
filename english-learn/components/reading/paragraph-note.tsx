"use client";

import { Check, StickyNote, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { getNotesForArticle, saveNoteForParagraph } from "@/lib/reading-library";

export function ParagraphNote({
  articleId,
  paragraphKey,
}: {
  articleId: string;
  paragraphKey: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load existing note on mount
  useEffect(() => {
    const notes = getNotesForArticle(articleId);
    const existing = notes.find((n) => n.paragraphKey === paragraphKey);
    if (existing) {
      setText(existing.text);
      setSaved(true);
    }
  }, [articleId, paragraphKey]);

  function handleSave() {
    saveNoteForParagraph(articleId, paragraphKey, text);
    setSaved(text.trim().length > 0);
    setIsOpen(false);
  }

  function handleDelete() {
    saveNoteForParagraph(articleId, paragraphKey, "");
    setText("");
    setSaved(false);
    setIsOpen(false);
  }

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex size-7 items-center justify-center rounded-lg border transition-colors ${
          saved
            ? "border-[#7b4b14]/30 bg-[#7b4b14]/10 text-[#7b4b14]"
            : "border-[rgba(20,50,75,0.12)] bg-white/80 text-[var(--ink-soft)] opacity-0 group-hover/para:opacity-100"
        } hover:border-[#7b4b14] hover:text-[#7b4b14]`}
        aria-label={saved ? "Edit note" : "Add note"}
        title={saved ? "Edit note" : "Add note"}
      >
        <StickyNote className="size-3.5" />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-8 z-20 w-72 rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-white p-3 shadow-[0_12px_32px_rgba(23,32,51,0.12)]">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
            Your note
          </p>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your thoughts about this paragraph..."
            className="min-h-[80px] w-full resize-none rounded-[0.8rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(247,234,210,0.25)] px-3 py-2 text-sm leading-6 text-[var(--ink)] outline-none placeholder:text-[var(--ink-soft)]/50 focus:border-[#7b4b14]/40"
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            {saved ? (
              <button
                type="button"
                onClick={handleDelete}
                className="text-xs font-medium text-[var(--coral)] hover:underline"
              >
                Delete note
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-[rgba(20,50,75,0.12)] bg-white text-[var(--ink-soft)] transition-colors hover:bg-[rgba(20,50,75,0.05)]"
                aria-label="Cancel"
              >
                <X className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-[#7b4b14]/30 bg-[#7b4b14] text-white transition-colors hover:bg-[#6a4012]"
                aria-label="Save note"
              >
                <Check className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
