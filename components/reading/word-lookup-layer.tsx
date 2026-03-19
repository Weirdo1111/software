"use client";

import { BookPlus, LoaderCircle, X } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: { definition: string; example?: string }[];
}

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  meanings: DictionaryMeaning[];
}

interface PopupPosition {
  word: string;
  top: number;
  left: number;
  showAbove: boolean;
}

export function WordLookupLayer({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popup, setPopup] = useState<PopupPosition | null>(null);
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [addStatus, setAddStatus] = useState<"idle" | "saving" | "done" | "no-db">("idle");

  const close = useCallback(() => setPopup(null), []);

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !containerRef.current) return;

    // Don't trigger inside interactive elements (note textarea, buttons, etc.)
    const anchor = sel.anchorNode;
    if (anchor) {
      const el = anchor instanceof Element ? anchor : anchor.parentElement;
      if (el?.closest("textarea, input, button, [role=button], [contenteditable]")) return;
    }

    const raw = sel.toString().trim();
    // Only handle 1–3 words, max 60 chars
    if (!raw || raw.split(/\s+/).length > 3 || raw.length > 60) return;

    const range = sel.getRangeAt(0);
    if (!containerRef.current.contains(range.commonAncestorContainer)) return;

    const rect = range.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const showAbove = spaceBelow < 300;

    setPopup({
      word: raw,
      top: showAbove ? rect.top : rect.bottom + 8,
      left: Math.max(12, Math.min(rect.left + rect.width / 2 - 160, window.innerWidth - 336)),
      showAbove,
    });
    setEntry(null);
    setNotFound(false);
    setAddStatus("idle");
    setLoading(true);

    // Clean to a single lookup term (strip punctuation from edges)
    const cleanWord = raw.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, "");
    if (!cleanWord) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data: DictionaryEntry[]) => {
        if (data?.[0]) {
          setEntry(data[0]);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, []);

  // Close on outside click, Escape, or scroll
  useEffect(() => {
    if (!popup) return;

    function onMouseDown(e: MouseEvent) {
      if (popupRef.current?.contains(e.target as Node)) return;
      close();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    function onScroll() {
      close();
    }

    // Small delay so the mouseup that opened the popup doesn't immediately close it
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", onMouseDown);
      document.addEventListener("keydown", onKeyDown);
      window.addEventListener("scroll", onScroll, true);
    }, 80);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [popup, close]);

  async function handleAddToDeck() {
    if (!popup || addStatus !== "idle") return;
    setAddStatus("saving");

    const backText = entry
      ? entry.meanings
          .slice(0, 2)
          .map((m) => `(${m.partOfSpeech}) ${m.definitions[0]?.definition}`)
          .join("; ")
      : popup.word;

    try {
      const res = await fetch("/api/review-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          words: [{ front: popup.word.toLowerCase(), back: backText, tag: "Reading" }],
        }),
      });
      if (!res.ok) {
        setAddStatus("idle");
        return;
      }
      const body = await res.json().catch(() => ({}));
      setAddStatus(body.persisted === false ? "no-db" : "done");
    } catch {
      setAddStatus("idle");
    }
  }

  return (
    <div ref={containerRef} onMouseUp={handleMouseUp}>
      {children}

      {popup
        ? createPortal(
            <div
              ref={popupRef}
              style={{
                position: "fixed",
                top: popup.showAbove ? undefined : popup.top,
                bottom: popup.showAbove ? window.innerHeight - popup.top + 8 : undefined,
                left: popup.left,
                zIndex: 9999,
              }}
              className="w-80 rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-white p-4 shadow-[0_16px_40px_rgba(23,32,51,0.15)]"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate text-base font-semibold text-[var(--ink)]">{popup.word}</h4>
                  {entry?.phonetic ? (
                    <p className="mt-0.5 text-xs text-[var(--ink-soft)]">{entry.phonetic}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-[rgba(20,50,75,0.1)] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
                  aria-label="Close"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              {/* Definition body */}
              {loading ? (
                <div className="mt-3 flex items-center gap-2 text-sm text-[var(--ink-soft)]">
                  <LoaderCircle className="size-4 animate-spin" />
                  Looking up definition…
                </div>
              ) : notFound ? (
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                  No definition found. You can still add this word to your review deck with your own
                  notes.
                </p>
              ) : entry ? (
                <div className="mt-3 grid max-h-48 gap-2.5 overflow-y-auto">
                  {entry.meanings.slice(0, 3).map((meaning, i) => (
                    <div key={`${meaning.partOfSpeech}-${i}`} className="text-sm">
                      <span className="inline-block rounded bg-[rgba(123,75,20,0.08)] px-1.5 py-0.5 text-xs font-semibold text-[#7b4b14]">
                        {meaning.partOfSpeech}
                      </span>
                      <p className="mt-1 leading-6 text-[var(--ink)]">
                        {meaning.definitions[0]?.definition}
                      </p>
                      {meaning.definitions[0]?.example ? (
                        <p className="mt-1 text-xs italic leading-5 text-[var(--ink-soft)]">
                          &ldquo;{meaning.definitions[0].example}&rdquo;
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Add to deck */}
              <div className="mt-3 border-t border-[rgba(20,50,75,0.08)] pt-3">
                <button
                  type="button"
                  onClick={handleAddToDeck}
                  disabled={addStatus !== "idle" || loading}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    addStatus === "done"
                      ? "bg-[#edf6f1] text-[#1a493f]"
                      : addStatus === "no-db"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-[#7b4b14] text-white hover:bg-[#6a4012] disabled:cursor-not-allowed disabled:opacity-50"
                  }`}
                >
                  {addStatus === "saving" ? (
                    <LoaderCircle className="size-3.5 animate-spin" />
                  ) : (
                    <BookPlus className="size-3.5" />
                  )}
                  {addStatus === "done"
                    ? "Added to deck"
                    : addStatus === "no-db"
                      ? "DB not configured"
                      : "Add to review deck"}
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
