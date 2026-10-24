import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Full-width single-metric band: one oversized viewport-scaled figure that
 * grows in as the viewer scrolls into it, with a mono eyebrow and a label
 * underneath. Use as a punch beat between the grid and the testimonial;
 * don't crowd it with secondary numbers.
 */
export interface StatProps extends SectionBaseProps {
  /** Small mono label above the figure. 1–3 words, no punctuation. */
  eyebrow?: string | null;
  /** The hero figure. Number plus optional unit, max 6 characters (e.g. "1200+", "99.2%"). */
  value: string;
  /** What the figure measures. 2–6 words, sentence case, no trailing period. */
  label: string;
  /** Supporting context line under the label. 1 sentence, 10–24 words. */
  support?: string | null;
}

export function Stat({ id, eyebrow, value, label, support }: StatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0.25, 1]);

  return (
    <section
      id={id ?? undefined}
      ref={ref}
      className="w-full border-b border-border bg-background px-6 py-24 text-center md:py-32"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
        <Reveal>
          {eyebrow ? (
            <p className="mb-8 font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
              {eyebrow}
            </p>
          ) : null}
        </Reveal>
        <motion.span
          style={{ scale, opacity }}
          className="block text-[clamp(4.5rem,18vw,13rem)] leading-[0.85] font-black tracking-tighter text-primary tabular-nums"
        >
          {value}
        </motion.span>
        <Reveal transition={{ delay: 0.1 }}>
          <h2 className="mt-6 text-2xl font-black tracking-tight uppercase md:text-4xl">
            {label}
          </h2>
        </Reveal>
        {support ? (
          <Reveal transition={{ delay: 0.16 }}>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">{support}</p>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

export const StatDemo: StatProps = {
  eyebrow: 'Since 2019',
  value: '1,200+',
  label: 'Units in the field',
  support:
    'From a single desktop enclosure to a full outdoor sensor line — every unit ships through the same shop floor.',
};
