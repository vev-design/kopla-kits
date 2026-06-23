import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'motion/react';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Oversized animated statistics. Each figure counts up from zero as the section
 * scrolls into view, with a monospace label underneath. A single expansive beat
 * to turn track record into a moment.
 *
 * @hydrate
 */
export interface StatsProps extends SectionBaseProps {
  /** Monospace label above the figures. 1–3 words, sentence case, no punctuation (e.g. "By the numbers"). */
  eyebrow?: string | null;
  /** Stat figures. 2–4 items. */
  stats: {
    /** Stat figure with optional prefix/suffix. The numeric part counts up; max 6 characters (e.g. "120+", "98%", "$4M"). */
    value: string;
    /** What the figure measures. 1–4 words, sentence case (e.g. "Projects shipped"). */
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

export function Stats({ id, eyebrow, stats }: StatsProps) {
  return (
    <section id={id ?? undefined} className="w-full border-b border-foreground bg-background">
      <div className="mx-auto w-full max-w-7xl px-6 py-20 md:py-28">
        {eyebrow ? (
          <Reveal>
            <p className="mb-14 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {eyebrow}
            </p>
          </Reveal>
        ) : null}
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Reveal key={stat.label} className="flex flex-col gap-3 border-t border-foreground pt-6">
              <span className="text-6xl font-bold leading-none tracking-[-0.03em] md:text-7xl lg:text-8xl">
                <StatFigure value={stat.value} />
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {stat.label}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export const StatsDemo: StatsProps = {
  eyebrow: 'By the numbers',
  stats: [
    { value: '120+', label: 'Projects shipped' },
    { value: '14', label: 'Years in practice' },
    { value: '38', label: 'Awards won' },
    { value: '96%', label: 'Client return rate' },
  ],
};
