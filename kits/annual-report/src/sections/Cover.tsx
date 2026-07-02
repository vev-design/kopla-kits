import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Reveal } from '@/motion';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * The report's title page — a full-viewport cover built around the kit's
 * signature motif: the fiscal year set as one enormous serif numeral filling
 * the page, outlined on the navy `image` variant and washed in pale navy on the
 * paper `plain` variant, with the title and tagline set against it. A masthead
 * hairline carries the company name and full period label; the background
 * image gets a gentle scroll parallax. Use as the very first section.
 */
export interface CoverProps extends SectionBaseProps {
  /** Company name, set small on the masthead rule. 1–4 words (e.g. "Meridian Industries"). */
  company: string;
  /** Report title. 1 short line, 2–5 words, no trailing period (e.g. "Annual Report"). */
  title: string;
  /** Fiscal year or period the report covers. The digits become the giant cover numeral. 4–9 characters (e.g. "2025", "FY 2025"). */
  year: string;
  /** Tagline / theme for the year. 1 sentence, 5–14 words, no trailing period. */
  tagline?: string | null;
  /**
   * Optional full-bleed background image (corporate / architecture). Wide aspect.
   * @kind image
   */
  image?: string | null;
  /** Layout variant. `image` sets an outlined numeral over a full-bleed photo on navy; `plain` sets a pale solid numeral on paper. */
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
  const onNavy = variant === 'image';
  const showImage = onNavy && image;
  // The giant numeral is the digits only — "FY 2025" mastheads in full but
  // covers as "2025" so long period labels never overflow the page.
  const numeral = year.match(/\d+/g)?.at(-1) ?? year;

  return (
    <section
      id={id ?? undefined}
      ref={ref}
      className={cn(
        'relative flex min-h-screen w-full flex-col overflow-hidden',
        onNavy ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground',
      )}
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

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-14 md:px-12 md:py-16">
        {/* Masthead — the hairline rule the numbered sections echo. */}
        <Reveal>
          <div
            className={cn(
              'flex items-baseline justify-between gap-6 border-b pb-4',
              onNavy ? 'border-primary-foreground/30' : 'border-border',
            )}
          >
            <p
              className={cn(
                'font-mono text-xs font-medium uppercase tracking-[0.28em]',
                onNavy ? 'text-primary-foreground/70' : 'text-muted-foreground',
              )}
            >
              {company}
            </p>
            <p
              className={cn(
                'font-mono text-xs font-medium uppercase tracking-[0.28em] tabular-nums',
                onNavy ? 'text-primary-foreground/70' : 'text-muted-foreground',
              )}
            >
              {year}
            </p>
          </div>
        </Reveal>

        {/* The signature: an enormous serif year numeral filling the page. */}
        <div className="flex flex-1 flex-col justify-center pt-8">
          <Reveal transition={{ delay: 0.05 }}>
            <span
              aria-hidden
              className={cn(
                'pointer-events-none block select-none text-right font-serif font-semibold leading-[0.78] tracking-tight tabular-nums',
                'text-[clamp(9rem,30vw,23rem)]',
                onNavy
                  ? 'text-transparent opacity-80 [-webkit-text-stroke:2px_var(--primary-foreground)]'
                  : 'text-primary/15',
              )}
            >
              {numeral}
            </span>
          </Reveal>

          <Reveal transition={{ delay: 0.1 }}>
            <h1 className="relative -mt-8 max-w-3xl font-serif text-5xl font-semibold leading-[0.98] tracking-tight text-balance md:-mt-16 md:text-7xl">
              {title}
            </h1>
          </Reveal>
        </div>

        {/* Folio line — tagline against the year, closed by a hairline. */}
        <Reveal transition={{ delay: 0.16 }}>
          <div
            className={cn(
              'mt-12 flex items-end justify-between gap-8 border-t pt-6',
              onNavy ? 'border-primary-foreground/30' : 'border-border',
            )}
          >
            {tagline ? (
              <p
                className={cn(
                  'max-w-md font-serif text-lg italic leading-snug text-pretty md:text-xl',
                  onNavy ? 'text-primary-foreground/85' : 'text-foreground/80',
                )}
              >
                {tagline}
              </p>
            ) : (
              <span />
            )}
            <p
              className={cn(
                'font-mono text-xs font-medium uppercase tracking-[0.2em] tabular-nums whitespace-nowrap',
                onNavy ? 'text-primary-foreground/60' : 'text-muted-foreground',
              )}
            >
              {numeral}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export const CoverDemo: CoverProps[] = [
  {
    company: 'Meridian Industries',
    title: 'Annual Report',
    year: '2025',
    tagline: 'A year of disciplined growth and steady returns for our shareholders',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1900&q=80',
    variant: 'image',
  },
  {
    company: 'Meridian Industries',
    title: 'Annual Report',
    year: 'FY 2025',
    tagline: 'The record of a year built on operational discipline',
    image: null,
    variant: 'plain',
  },
];
