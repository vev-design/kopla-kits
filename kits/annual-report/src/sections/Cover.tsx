import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Reveal } from '@/motion';
import { Badge } from '@/components/Badge';
import type { SectionBaseProps } from '@/types';

/**
 * The report's title page — a full-viewport, serif-led cover that opens the
 * document. Leads with the company name, the report title, the fiscal year, and
 * a single forward-looking tagline, over an optional full-bleed image with a
 * gentle scroll parallax. Use as the very first section.
 */
export interface CoverProps extends SectionBaseProps {
  /** Company name, set small above the title. 1–4 words (e.g. "Meridian Industries"). */
  company: string;
  /** Report title. 1 short line, 2–5 words, no trailing period (e.g. "Annual Report"). */
  title: string;
  /** Fiscal year or period the report covers. 4–9 characters (e.g. "2025", "FY 2025"). */
  year: string;
  /** Tagline / theme for the year. 1 sentence, 5–14 words, no trailing period. */
  tagline?: string | null;
  /**
   * Optional full-bleed background image (corporate / architecture). Wide aspect.
   * @kind image
   */
  image?: string | null;
  /** Layout variant. `image` overlays type on a full-bleed photo; `plain` is type on paper. */
  variant?: 'image' | 'plain';
}

export function Cover({
  id,
  company,
  title,
  year,
  tagline,
  image,
  variant = 'image',
}: CoverProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const showImage = variant === 'image' && image;

  return (
    <section
      id={id ?? undefined}
      ref={ref}
      className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-primary text-primary-foreground"
    >
      {showImage ? (
        <>
          <motion.img
            src={image}
            alt=""
            style={{ y }}
            className="pointer-events-none absolute inset-0 h-[118%] w-full object-cover opacity-35"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/30"
          />
        </>
      ) : null}

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between px-6 py-16 md:px-12 md:py-20">
        <Reveal>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.28em] text-primary-foreground/70">
            {company}
          </p>
        </Reveal>

        <div className="flex flex-col gap-8">
          <Reveal>
            <h1 className="font-serif text-6xl font-semibold leading-[0.95] tracking-tight text-balance md:text-8xl lg:text-9xl">
              {title}
            </h1>
          </Reveal>
          <Reveal transition={{ delay: 0.08 }}>
            <span className="block font-serif text-5xl font-normal tabular-nums text-primary-foreground/80 md:text-6xl">
              {year}
            </span>
          </Reveal>
        </div>

        <div className="flex items-end justify-between gap-8">
          {tagline ? (
            <Reveal transition={{ delay: 0.12 }}>
              <p className="max-w-md font-serif text-xl italic leading-snug text-primary-foreground/85 text-pretty md:text-2xl">
                {tagline}
              </p>
            </Reveal>
          ) : (
            <span />
          )}
          <Reveal transition={{ delay: 0.16 }}>
            <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground/70">
              {year}
            </Badge>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export const CoverDemo: CoverProps = {
  company: 'Meridian Industries',
  title: 'Annual Report',
  year: '2025',
  tagline: 'A year of disciplined growth and steady returns for our shareholders',
  image:
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1900&q=80',
  variant: 'image',
};
