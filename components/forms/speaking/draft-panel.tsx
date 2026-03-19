// Date: 2026/3/18
// Author: Tianbo Cao
// Kept the draft panel focused on the single text field used for speaking scoring.
export function SpeakingDraftPanel({
  transcript,
  onTranscriptChange,
}: {
  transcript: string;
  onTranscriptChange: (value: string) => void;
}) {
  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="rounded-[1.6rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Transcript</p>
          <p className="mt-3 text-lg font-semibold text-[var(--ink)]">Edit the final version for scoring.</p>
        </div>
        <span className="rounded-full bg-[rgba(20,50,75,0.05)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
          {wordCount} words
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">Keep only the version you want the AI to judge.</p>
      <label className="mt-4 grid gap-2 text-sm font-medium text-[var(--ink)]">
        Transcript
        <textarea
          value={transcript}
          onChange={(event) => onTranscriptChange(event.target.value)}
          placeholder="Write the final version of your spoken response here."
          className="min-h-56 rounded-[1.25rem] border border-[rgba(20,50,75,0.16)] bg-white/82 px-4 py-3 text-sm leading-7 outline-none"
        />
      </label>
    </div>
  );
}
