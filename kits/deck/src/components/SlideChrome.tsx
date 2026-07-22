import { cn } from '@/lib/utils';

/**
 * Position of a slide within the deck. Drives the mono counter ("02 / 06")
 * and the progress dots (the `current` dot is filled).
 */
export interface SlideProgress {
  /** 1-based position of this slide in the deck (1 = title slide). */
  current: number;
  /** Total number of slides in the deck. Keep identical on every slide. */
  total: number;
}

/**
 * Internal slide furniture shared by every slide section — deliberately NOT
 * part of the public component catalog. Pins a mono slide counter plus a row
 * of progress dots (current slide filled) to the top-right corner, and an
 * optional running footer label (deck title / occasion) to the bottom-left.
 * Rendered as the first child of a section's relatively-positioned root so
 * the chrome lands in exactly the same spot on every slide. Sections expose
 * it through their `progress` and `footer` props; passing neither renders
 * nothing.
 */
export interface SlideChromeProps {
  /** Slide position; renders the counter and dots. Null hides both. */
  progress?: SlideProgress | null;
  /** Running footer label (deck title / occasion). Null hides it. */
  footer?: string | null;
}

export function SlideChrome({ progress, footer }: SlideChromeProps) {
  if (!progress && !footer) return null;
  const total = progress ? Math.max(1, Math.round(progress.total)) : 0;
  const current = progress
    ? Math.min(Math.max(1, Math.round(progress.current)), total)
    : 0;

  return (
    <>
      {progress ? (
        <div className="pointer-events-none absolute top-10 right-6 z-10 flex items-center gap-4 md:right-16">
          {/* Dots read at a glance; hidden for very long decks where a dot
              row would stop scanning cleanly. The counter always shows. */}
          {total >= 2 && total <= 10 ? (
            <span aria-hidden className="flex items-center gap-1.5">
              {Array.from({ length: total }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    'size-1.5 rounded-full',
                    i + 1 === current ? 'bg-primary' : 'bg-foreground/25',
                  )}
                />
              ))}
            </span>
          ) : null}
          <span
            data-slot="counter"
            className="font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground tabular-nums"
          >
            {String(current).padStart(2, '0')} /{' '}
            {String(total).padStart(2, '0')}
          </span>
        </div>
      ) : null}
      {footer ? (
        <p
          data-slot="footer"
          className="pointer-events-none absolute bottom-10 left-6 z-10 font-mono text-xs tracking-[0.2em] text-muted-foreground/80 uppercase md:left-16"
        >
          {footer}
        </p>
      ) : null}
    </>
  );
}
