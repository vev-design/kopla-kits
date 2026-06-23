import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'motion/react';
import { Reveal } from '@/motion';
import { Badge } from '@/components/Badge';
import type { SectionBaseProps } from '@/types';

/**
 * The year's key figures — a grid of oversized serif numbers that count up from
 * zero as the section scrolls into view, each with a label and an optional
 * change indicator. The signature data beat of the report. Keep figures to the
 * handful that matter most.
 *
 * @hydrate
 */
export interface HighlightsProps extends SectionBaseProps {
  /** Small label above the heading. 1–4 words, no punctuation (e.g. "Financial Highlights"). */
  eyebrow?: string | null;
  /** Section heading. 1 sentence, 3–8 words, no trailing period. */
  heading: string;
  /** Key figures. 3–6 items. */
  figures: {
    /** Figure with optional prefix/suffix. The numeric part counts up; max 7 characters (e.g. "$4.2B", "+18%", "1,240"). */
    value: string;
    /** What the figure measures. 1–5 words, sentence case (e.g. "Total revenue"). */
    label: string;
    /** Optional year-over-year change line. Max 16 characters (e.g. "+12% YoY"). */
    delta?: string | null;
  }[];
}

/** Splits "$4.2B" → { prefix: "$", num: 4.2, suffix: "B", decimals: 1 }. */
function parseValue(value: string) {
  const match = value.match(/-?\d[\d,]*(\.\d+)?/);
  if (!match) return { prefix: value, num: 0, suffix: '', decimals: 0 };
  const raw = match[0];
  const num = parseFloat(raw.replace(/,/g, ''));
  const decimals = raw.includes('.') ? raw.split('.')[1].length : 0;
  const grouped = raw.includes(',');
  return {
    prefix: value.slice(0, match.index),
    num,
    suffix: value.slice((match.index ?? 0) + raw.length),
    decimals,
    grouped,
  };
}

function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-12% 0px' });
  const { prefix, num, suffix, decimals, grouped } = parseValue(value);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, num, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) =>
        setDisplay(
          latest.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
            useGrouping: grouped,
          }),
        ),
    });
    return () => controls.stop();
  }, [inView, num, decimals, grouped]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

export function Highlights({ id, eyebrow, heading, figures }: HighlightsProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-secondary">
      <div className="mx-auto w-full max-w-6xl px-6 py-24 md:px-12 md:py-32">
        <Reveal className="mb-16 max-w-2xl">
          {eyebrow ? <Badge variant="rule">{eyebrow}</Badge> : null}
          <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight tracking-tight text-balance md:text-5xl">
            {heading}
          </h2>
        </Reveal>

        <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {figures.map((figure) => (
            <Reveal
              key={figure.label}
              className="flex flex-col gap-3 border-t-2 border-primary pt-6"
            >
              <span className="block font-serif text-6xl font-semibold leading-none tracking-tight text-primary md:text-7xl">
                <CountUp value={figure.value} />
              </span>
              <span className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {figure.label}
              </span>
              {figure.delta ? (
                <span className="font-mono text-xs font-medium tracking-wide text-secondary-foreground">
                  {figure.delta}
                </span>
              ) : null}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export const HighlightsDemo: HighlightsProps = {
  eyebrow: 'Financial Highlights',
  heading: 'The year in numbers',
  figures: [
    { value: '$4.2B', label: 'Total revenue', delta: '+12% YoY' },
    { value: '+18%', label: 'Operating margin', delta: '+220 bps' },
    { value: '$1.1B', label: 'Free cash flow', delta: 'Record high' },
    { value: '1,240', label: 'Employees worldwide', delta: '+9% YoY' },
    { value: '42', label: 'Countries served', delta: '+6 markets' },
    { value: '94%', label: 'Customer retention', delta: '+2 pts' },
  ],
};
