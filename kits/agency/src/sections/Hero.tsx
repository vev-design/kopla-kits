import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Type-led opening statement: an oversized display headline with one optional
 * accent word, a short subhead, and a primary call-to-action. Brutalist and
 * confident — lots of whitespace, tight tracking, a monospace label. Use as
 * the first content section after the navbar.
 */
export interface HeroProps extends SectionBaseProps {
  /** Monospace label above the headline. 2–4 words, sentence case, no punctuation (e.g. "Independent design studio"). */
  eyebrow?: string | null;
  /** Oversized statement. 1 phrase, 3–7 words, no trailing period. */
  headline: string;
  /** Single word inside the headline rendered in the accent color. Must appear verbatim in `headline`; omit for an all-ink headline. */
  accentWord?: string | null;
  /** Supporting subhead under the headline. 1–2 sentences, 14–30 words. */
  subhead?: string | null;
  /** Primary call-to-action button. */
  cta: {
    /** Button label. 2–3 words, sentence case (e.g. "Start a project"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  };
}

function renderHeadline(headline: string, accentWord?: string | null) {
  if (!accentWord) return headline;
  const idx = headline.indexOf(accentWord);
  if (idx === -1) return headline;
  return (
    <>
      {headline.slice(0, idx)}
      <span className="text-primary">{accentWord}</span>
      {headline.slice(idx + accentWord.length)}
    </>
  );
}

export function Hero({ id, eyebrow, headline, accentWord, subhead, cta }: HeroProps) {
  return (
    <section id={id ?? undefined} className="w-full border-b border-foreground bg-background">
      <div className="mx-auto w-full max-w-7xl px-6 pt-24 pb-20 md:pt-32 md:pb-28">
        <Reveal className="flex flex-col gap-10">
          {eyebrow ? (
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="max-w-5xl text-6xl font-bold leading-[0.92] tracking-[-0.03em] text-balance uppercase sm:text-7xl md:text-8xl lg:text-9xl">
            {renderHeadline(headline, accentWord)}
          </h1>
          <div className="flex flex-col items-start gap-8 border-t border-border pt-8 md:flex-row md:items-center md:justify-between">
            {subhead ? (
              <p className="max-w-xl text-lg text-muted-foreground text-pretty md:text-xl">
                {subhead}
              </p>
            ) : null}
            <Button
              asChild
              size="lg"
              className="rounded-sm font-mono text-xs uppercase tracking-[0.14em]"
            >
              <a href={cta.href}>
                {cta.label}
                <ArrowUpRight />
              </a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export const HeroDemo: HeroProps = {
  eyebrow: 'Independent design studio',
  headline: 'We build bold brands',
  accentWord: 'bold',
  subhead:
    'Field Studio is a creative practice making identity, web, and motion for companies that refuse to look like everyone else.',
  cta: { label: 'Start a project', href: '#contact' },
};
