interface ProgressRingProps {
  value: number;
  size?: number;
  stroke?: number;
  label: string;
  subLabel?: string;
  tone?: "teal" | "orange" | "lime";
}

const toneStyles = {
  teal: "#0891b2",
  orange: "#ea580c",
  lime: "#65a30d",
} as const;

export function ProgressRing({ value, size = 136, stroke = 11, label, subLabel, tone = "teal" }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="inline-flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(15,23,42,0.12)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={toneStyles[tone]}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 380ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <p className="text-2xl font-semibold tracking-tight">{clamped}%</p>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold tracking-tight">{label}</p>
        {subLabel ? <p className="text-xs text-black/60">{subLabel}</p> : null}
      </div>
    </div>
  );
}
