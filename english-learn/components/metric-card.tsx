import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "accent";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        tone === "accent" ? "border-black bg-black text-white" : "border-black/15 bg-white",
      )}
    >
      <p className={cn("text-sm", tone === "accent" ? "text-white/70" : "text-black/60")}>{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className={cn("mt-2 text-xs", tone === "accent" ? "text-white/70" : "text-black/55")}>{hint}</p> : null}
    </div>
  );
}
