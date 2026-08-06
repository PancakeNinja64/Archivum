import { coverageColorVar } from "@/lib/utils";

type Size = "sm" | "md" | "lg";
const dims: Record<Size, { box: number; stroke: number; text: string }> = {
  sm: { box: 40, stroke: 3, text: "text-[13px]" },
  md: { box: 64, stroke: 4, text: "text-lg" },
  lg: { box: 176, stroke: 6, text: "text-6xl" },
};

/** Arc gauge for Documentation Coverage. The arc echoes the mark's baseline: a sweep, not a full ring. */
export function CoverageGauge({ value, size = "md", className = "" }: { value: number; size?: Size; className?: string }) {
  const { box, stroke, text } = dims[size];
  const r = (box - stroke) / 2;
  const cx = box / 2;
  const circumference = 2 * Math.PI * r;
  const arcLen = circumference * 0.75;
  const filled = arcLen * (value / 100);
  const color = coverageColorVar(value);
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: box, height: box }}
      role="img"
      aria-label={`Documentation Coverage ${value} percent`}
    >
      <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} className="-rotate-[135deg]" aria-hidden>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke}
          strokeDasharray={`${arcLen} ${circumference}`} strokeLinecap="round" />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${filled} ${circumference}`} strokeLinecap="round" />
      </svg>
      <span className={`tnum absolute font-mono ${text}`} style={{ color }}>{value}<span className="text-[0.45em] opacity-70">%</span></span>
    </span>
  );
}
