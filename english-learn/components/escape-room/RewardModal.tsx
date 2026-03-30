import { BadgeCheck, Sparkles, Trophy } from "lucide-react";

import { ModalShell } from "@/components/escape-room/ModalShell";
import type { RewardState } from "@/components/escape-room/types";

export function RewardModal({
  reward,
  elapsedLabel,
  bestLabel,
  rank,
  onClose,
  title = "Quest Reward",
  subtitle = "The lock clicks open and the library exit finally slides free.",
  successTitle = "You escaped the library!",
}: {
  reward: RewardState;
  elapsedLabel: string;
  bestLabel: string;
  rank: string;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  successTitle?: string;
}) {
  return (
    <ModalShell title={title} subtitle={subtitle} onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-[1.6rem] border border-emerald-200 bg-[linear-gradient(135deg,rgba(220,252,231,0.84),rgba(255,251,244,0.92))] p-5">
          <div className="flex items-center gap-2 text-emerald-700">
            <Trophy className="size-5" />
            <p className="text-base font-semibold tracking-tight">{successTitle}</p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-[1.2rem] border border-[#e6decf] bg-white/90 p-4">
              <div className="flex items-center gap-2 text-teal-700">
                <Sparkles className="size-4" />
                <p className="text-sm font-semibold">XP reward</p>
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">+{reward.xpEarned} XP</p>
            </div>

            <div className="rounded-[1.2rem] border border-[#e6decf] bg-white/90 p-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <BadgeCheck className="size-4" />
                <p className="text-sm font-semibold">Badge unlocked</p>
              </div>
              <p className="mt-2 text-lg font-semibold tracking-tight text-slate-900">{reward.badgeUnlocked}</p>
            </div>

            <div className="rounded-[1.2rem] border border-[#e6decf] bg-white/90 p-4">
              <p className="text-sm font-semibold text-slate-700">Clear time</p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-slate-900">{elapsedLabel}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">Best {bestLabel}</p>
            </div>

            <div className="rounded-[1.2rem] border border-[#e6decf] bg-white/90 p-4">
              <p className="text-sm font-semibold text-slate-700">Quest status</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{rank}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">Quest completed</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
          >
            Close reward
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
