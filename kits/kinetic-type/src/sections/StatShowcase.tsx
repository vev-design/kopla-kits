import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'motion/react';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Three (or more) oversized numbers that roll up from zero in a one-shot
 * count-up the moment the section scrolls into view. Numerals render in
 * black-weight Archivo, huge enough to read as the section's whole visual.
 * Use after the statement grid to back the claims with proof.
 *
 * @hydrate
 */
export interface StatShowcaseProps extends SectionBaseProps {
  /** Small monospace label above the figures. 1–3 words, sentence case (e.g. "In numbers"). */
  eyebrow?: string | null;
  /** Stat figures. 3 items read best; up to 4 is fine. */
  stats: {
    /** The number that counts up. Plain numeric value, no units (e.g. 240). */
    value: number;
    /** Unit shown after the number. Max 3 characters (e.g. "%", "x", "M"). */
    suffix?: string | null;
    /** What the figure measures. 1–4 words, sentence case (e.g. "Faster page loads"). */
    label: string;
  }[];
}

function CountUpFigure({ value, suffix }: { value: number; suffix?: string | null }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const [display, setDisplay] = useState('0');
  const played = useRef(false);

  useEffect(() => {
    if (!inView || played.current) return;
    played.current = true;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest).toLocaleString('en-US')),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

export function StatShowcase({ id, eyebrow, stats }: StatShowcaseProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-foreground">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        {eyebrow ? (
          <Reveal>
            <p className="mb-14 font-mono text-xs tracking-[0.18em] text-background/60 uppercase">
              {eyebrow}
            </p>
          </Reveal>
        ) : null}
        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-3">
          {stats.map((stat) => (
            <Reveal key={stat.label} className="flex flex-col gap-3">
              <span
                className="text-7xl leading-none tracking-tight text-background md:text-8xl"
                style={{ fontVariationSettings: "'wght' 900" }}
              >
                <CountUpFigure value={stat.value} suffix={stat.suffix} />
              </span>
              <span className="font-mono text-xs tracking-[0.14em] text-background/60 uppercase">
                {stat.label}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export const StatShowcaseDemo: StatShowcaseProps = {
  eyebrow: 'In numbers',
  stats: [
    { value: 240, suffix: '%', label: 'Scroll depth vs. static pages' },
    { value: 4, suffix: 'x', label: 'Time on page' },
    { value: 98, suffix: '%', label: 'Load without a single photo' },
  ],
};
