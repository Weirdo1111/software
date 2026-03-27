import type { ReactNode } from "react";
import { X } from "lucide-react";

export function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-[rgba(3,9,18,0.82)] backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(25,211,197,0.18),transparent_22%),radial-gradient(circle_at_80%_12%,rgba(255,209,102,0.14),transparent_18%),radial-gradient(circle_at_50%_100%,rgba(44,140,255,0.2),transparent_28%)]" />
      <div className="relative flex min-h-full items-end justify-center p-3 sm:items-center sm:p-6">
        <div className="quest-console-enter quest-console-flicker quest-console-flash relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-cyan-300/16 bg-[linear-gradient(145deg,rgba(6,15,28,0.98),rgba(10,24,40,0.97))] text-white shadow-[0_40px_120px_rgba(0,0,0,0.48)]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:26px_26px] opacity-35" />
          <div className="pointer-events-none absolute left-5 top-5 h-10 w-10 border-l border-t border-cyan-300/28" />
          <div className="pointer-events-none absolute bottom-5 right-5 h-10 w-10 border-b border-r border-cyan-300/28" />
          <div className="relative border-b border-white/10 px-5 py-5 sm:px-7 sm:py-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center rounded-full border border-cyan-300/18 bg-cyan-300/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-100">
                  Quest Console
                </p>
                <h3 className="font-display mt-4 text-3xl tracking-tight text-white sm:text-4xl">{title}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{subtitle}</p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex size-11 items-center justify-center rounded-2xl border border-white/12 bg-white/8 text-white transition hover:scale-[1.03] hover:bg-white/12"
                aria-label="Close modal"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5">Interactive Puzzle</span>
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5">English Quest</span>
            </div>
          </div>

          <div className="relative p-5 sm:p-7">
            <div className="rounded-[1.7rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 sm:p-5">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
