"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function CheckoutButton({
  priceId,
  label,
  tone = "dark",
}: {
  priceId: string;
  label: string;
  tone?: "dark" | "light";
}) {
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onClick() {
    setStatus("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price_id: priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed.");
      }

      setStatus("Redirecting to checkout...");
      window.location.href = data.checkout_url;
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Checkout failed.";
      setStatus(message);
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45",
          tone === "dark"
            ? "bg-[var(--navy)] text-[#f7efe3]"
            : "border border-[rgba(20,50,75,0.16)] bg-white/84 text-[var(--ink)] hover:bg-[rgba(20,50,75,0.08)]",
        )}
      >
        {isLoading ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        {isLoading ? "Preparing checkout..." : label}
      </button>
      {status ? <p className="text-xs text-[var(--ink-soft)]">{status}</p> : null}
    </div>
  );
}
