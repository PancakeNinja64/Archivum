/**
 * Board legend.
 *
 * The board encodes three things at once, so all three are named here. The
 * ramp gradient is written from tokens, not from literals, so it follows the
 * theme like everything else on the canvas.
 */
export function BoardLegend() {
  return (
    <div className="flex flex-wrap items-start gap-x-10 gap-y-5">
      <div>
        <p className="pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Decay index
        </p>
        <div
          className="h-1.5 w-44"
          style={{
            backgroundImage:
              'linear-gradient(90deg, var(--tier-inferred) 0%, var(--tier-asserted) 55%, var(--risk) 100%)',
          }}
        />
        <div className="mt-1.5 flex w-44 justify-between font-mono text-[10px] text-muted-foreground">
          <span>0 recent</span>
          <span>100 distant</span>
        </div>
      </div>

      <div>
        <p className="pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Height
        </p>
        <p className="max-w-[15rem] text-[12px] leading-relaxed text-muted-foreground">
          The same index. Taller means further from retrievable.
        </p>
      </div>

      <div>
        <p className="pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Cap
        </p>
        <p className="max-w-[15rem] text-[12px] leading-relaxed text-muted-foreground">
          Documentation coverage at the final successful check, on the same arc as every
          coverage gauge on the site.
        </p>
      </div>

      <div>
        <p className="pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Socket
        </p>
        <div className="flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="shrink-0">
            <circle cx="6" cy="6" r="4" fill="none" stroke="var(--border-strong)" strokeWidth="1" />
          </svg>
          <p className="max-w-[13rem] text-[12px] leading-relaxed text-muted-foreground">
            Downstream references — not yet measured.
          </p>
        </div>
      </div>
    </div>
  );
}
