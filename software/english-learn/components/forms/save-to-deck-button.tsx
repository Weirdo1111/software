"use client";

import { BookPlus, CheckCircle2, LoaderCircle } from "lucide-react";
import { useState } from "react";

export function SaveToDeckButton({
  items,
  tag,
}: {
  /** Array of { front, back } entries to save as review cards */
  items: { front: string; back: string }[];
  tag: string;
}) {
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "no-db">("idle");

  if (items.length === 0) return null;

  async function handleSave() {
    if (status !== "idle") return;
    setStatus("saving");

    try {
      const res = await fetch("/api/review-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          words: items.map((item) => ({ front: item.front, back: item.back, tag })),
        }),
      });
      if (!res.ok) {
        setStatus("idle");
        return;
      }
      const body = await res.json().catch(() => ({}));
      setStatus(body.persisted === false ? "no-db" : "done");
    } catch {
      setStatus("idle");
    }
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={status !== "idle"}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
        status === "done"
          ? "bg-[#edf6f1] text-[#1a493f]"
          : status === "no-db"
            ? "bg-amber-50 text-amber-700"
            : "border border-[rgba(20,50,75,0.16)] bg-white/80 text-[var(--ink)] hover:border-[#7b4b14] hover:text-[#7b4b14] disabled:opacity-50"
      }`}
    >
      {status === "saving" ? (
        <LoaderCircle className="size-3.5 animate-spin" />
      ) : status === "done" ? (
        <CheckCircle2 className="size-3.5" />
      ) : (
        <BookPlus className="size-3.5" />
      )}
      {status === "done"
        ? `${items.length} tip${items.length > 1 ? "s" : ""} added to review deck`
        : status === "no-db"
          ? "Database not configured — not saved"
          : `Save ${items.length} tip${items.length > 1 ? "s" : ""} to review deck`}
    </button>
  );
}
