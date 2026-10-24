import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'motion/react';
import { Card } from '@/components/Card';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * A row of glass tiles, each holding one oversized figure that counts up
 * from zero as it enters the viewport. A quick, glowing proof-of-momentum
 * beat between the showcase and the testimonial.
 *
 * @hydrate
 */
export interface StatRowProps extends SectionBaseProps {
  /** Small label above the row. 1–3 words, sentence case (e.g. "In numbers"). */
  eyebrow?: string | null;
  /** Stat figures. 3–4 items. */
  stats: {
    /** Stat figure with optional prefix/suffix. The numeric part counts up; max 6 characters (e.g. "40K+", "99%", "2.4x"). */
    value: string;
    /** What the figure measures. 1–4 words, sentence case (e.g. "Active workspaces"). */
    label: string;
  }[];
}

/** Splits "120+" → { prefix: "", num: 120, suffix: "+", decimals: 0 }. */
function parseValue(value: string) {
  const match = value.match(/-?\d[\d,]*(\.\d+)?/);
  if (!match) return { prefix: value, num: 0, suffix: '', decimals: 0 };
  const raw = match[0];
  const num = parseFloat(raw.replace(/,/g, ''));
  const decimals = raw.includes('.') ? raw.split('.')[1].length : 0;
  return {
    prefix: value.slice(0, match.index),
    num,
    suffix: value.slice((match.index ?? 0) + raw.length),
    decimals,
  };
}

function StatFigure({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const { prefix, num, suffix, decimals } = parseValue(value);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, num, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) =>
        setDisplay(
          latest.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }),
        ),
    });
    return () => controls.stop();
  }, [inView, num, decimals]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

export function StatRow({ id, eyebrow, stats }: StatRowProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        {eyebrow ? (
          <Reveal>
            <p className="mb-10 text-center font-mono text-xs tracking-[0.18em] text-accent-foreground uppercase">
              {eyebrow}
            </p>
          </Reveal>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <Reveal key={stat.label}>
              <Card variant="tile" className="h-full">
                <span className="font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight md:text-6xl">
                  <StatFigure value={stat.value} />
                </span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export const StatRowDemo: StatRowProps = {
  eyebrow: 'In numbers',
  stats: [
    { value: '40K+', label: 'Screens rendered daily' },
    { value: '99%', label: 'Uptime across regions' },
    { value: '2.4x', label: 'Faster than the old stack' },
  ],
};
