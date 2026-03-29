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
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-[rgba(244,239,228,0.82)] backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,215,128,0.28),transparent_22%),radial-gradient(circle_at_80%_12%,rgba(123,205,196,0.18),transparent_18%),radial-gradient(circle_at_50%_100%,rgba(112,163,255,0.18),transparent_28%)]" />
      <div className="relative flex min-h-full items-end justify-center p-3 sm:items-center sm:p-6">
        <div className="quest-console-enter quest-console-flicker quest-console-flash relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[#e8dcc7] bg-[linear-gradient(145deg,rgba(255,252,245,0.98),rgba(248,242,230,0.97))] text-slate-900 shadow-[0_40px_120px_rgba(80,60,20,0.18)]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:26px_26px] opacity-35" />
          <div className="pointer-events-none absolute left-5 top-5 h-10 w-10 border-l border-t border-teal-300/45" />
          <div className="pointer-events-none absolute bottom-5 right-5 h-10 w-10 border-b border-r border-amber-300/45" />
          <div className="relative border-b border-[#eadfcb] px-5 py-5 sm:px-7 sm:py-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center rounded-full border border-teal-300 bg-teal-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.26em] text-teal-800">
                  Quest Console
                </p>
                <h3 className="font-display mt-4 text-3xl tracking-tight text-slate-900 sm:text-4xl">{title}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">{subtitle}</p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex size-11 items-center justify-center rounded-2xl border border-[#d9d7cf] bg-white/92 text-slate-700 transition hover:scale-[1.03] hover:bg-white"
                aria-label="Close modal"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              <span className="rounded-full border border-[#e1dac8] bg-white/90 px-3 py-1.5">Interactive Puzzle</span>
              <span className="rounded-full border border-[#e1dac8] bg-white/90 px-3 py-1.5">English Quest</span>
            </div>
          </div>

          <div className="relative p-5 sm:p-7">
            <div className="rounded-[1.7rem] border border-[#e9dfcf] bg-white/78 p-4 sm:p-5">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
