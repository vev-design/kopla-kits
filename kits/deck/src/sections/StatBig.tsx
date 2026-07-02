import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Reveal } from '@/motion';
import { Eyebrow } from '@/components';
import { SlideChrome, type SlideProgress } from '@/components/SlideChrome';
import type { SectionBaseProps } from '@/types';

/**
 * Full-screen single-metric slide where the number is the hero. One oversized
 * figure that scales up as the viewer scrolls into it, with a label and a
 * short supporting line. Use as a punch beat to make one data point land hard;
 * do not crowd it with secondary stats.
 */
export interface StatBigProps extends SectionBaseProps {
  /** Small uppercase label above the metric. 1–3 words, no punctuation. */
  eyebrow?: string | null;
  /** The hero figure. Number plus optional unit, max 6 characters (e.g. "12M", "98%", "3.4x"). */
  value: string;
  /** What the figure measures. 2–5 words, sentence case, no trailing period. */
  label: string;
  /** Supporting context line under the label. 1 sentence, 10–24 words. */
  support?: string | null;
  /** This slide's position in the deck, rendered as slide chrome — a mono "03 / 06" counter plus progress dots in the top-right corner. Use the same `total` on every slide; omit to hide. */
  progress?: SlideProgress | null;
  /** Running footer label pinned bottom-left — deck title or occasion (e.g. "Northwind — Series A"). 2–5 words, max 40 characters; omit to hide. */
  footer?: string | null;
}

export function StatBig({
  id,
  eyebrow,
  value,
  label,
  support,
  progress,
  footer,
}: StatBigProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });
  // Scroll-scaled hero number: grows and fades up as the section enters.
  const scale = useTransform(scrollYProgress, [0, 1], [0.78, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0.2, 1]);

  return (
    <section
      id={id ?? undefined}
      ref={ref}
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-6 py-24 text-center md:px-16"
    >
      <SlideChrome progress={progress} footer={footer} />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center">
        <Reveal>
          {eyebrow ? <Eyebrow className="mb-8">{eyebrow}</Eyebrow> : null}
        </Reveal>
        <motion.span
          style={{ scale, opacity }}
          className="block font-display text-[8rem] leading-[0.9] font-bold tracking-tighter text-primary tabular-nums md:text-[16rem] lg:text-[20rem]"
        >
          {value}
        </motion.span>
        <Reveal transition={{ delay: 0.1 }}>
          <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight md:text-5xl">
            {label}
          </h2>
        </Reveal>
        {support ? (
          <Reveal transition={{ delay: 0.16 }}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty md:text-xl">
              {support}
            </p>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

export const StatBigDemo: StatBigProps = {
  eyebrow: 'Traction',
  value: '142%',
  label: 'Net revenue retention',
  support:
    'Customers spend more with us every quarter, and almost none of them leave once a crew is live in the field.',
  progress: { current: 3, total: 6 },
  footer: 'Northwind — Series A',
};
