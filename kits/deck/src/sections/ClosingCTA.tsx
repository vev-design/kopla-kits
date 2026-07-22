import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components';
import { SlideChrome, type SlideProgress } from '@/components/SlideChrome';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Full-screen closing slide: a final statement, a single call-to-action, and a
 * contact line. Lands the ask and closes the loop the title slide opened. Use
 * as the last section of the deck.
 */
export interface ClosingCTAProps extends SectionBaseProps {
  /** Small uppercase label above the statement. 1–2 words, no punctuation. */
  eyebrow?: string | null;
  /** Closing statement — the final dominant line. 3–8 words, no trailing period. */
  statement: string;
  /** Optional supporting line under the statement. 1 sentence, 10–24 words. */
  body?: string | null;
  /** Primary call-to-action button. */
  cta?: {
    /** Visible button label. 1–3 words, sentence case (e.g. "Talk to us"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  } | null;
  /** Contact line under the CTA (e.g. an email or website). Max 40 characters. */
  contact?: string | null;
  /** This slide's position in the deck, rendered as slide chrome — a mono "06 / 06" counter plus progress dots in the top-right corner. Use the same `total` on every slide; omit to hide. */
  progress?: SlideProgress | null;
  /** Running footer label pinned bottom-left — deck title or occasion (e.g. "Northwind — Series A"). 2–5 words, max 40 characters; omit to hide. */
  footer?: string | null;
}

export function ClosingCTA({
  id,
  eyebrow,
  statement,
  body,
  cta,
  contact,
  progress,
  footer,
}: ClosingCTAProps) {
  return (
    <section
      id={id ?? undefined}
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-6 py-24 text-center md:px-16"
    >
      <SlideChrome progress={progress} footer={footer} />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-0 h-[34rem] w-[34rem] rounded-full bg-primary/15 blur-3xl"
      />
      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center">
        <Reveal>
          {eyebrow ? (
            <Eyebrow data-slot="eyebrow" className="mb-8">
              {eyebrow}
            </Eyebrow>
          ) : null}
        </Reveal>
        <Reveal transition={{ delay: 0.06 }}>
          <h2
            data-slot="heading"
            className="font-display text-5xl leading-[0.98] font-bold tracking-tight text-balance md:text-8xl"
          >
            {statement}
          </h2>
        </Reveal>
        {body ? (
          <Reveal transition={{ delay: 0.12 }}>
            <p
              data-slot="body"
              className="mt-8 max-w-2xl text-xl leading-relaxed text-muted-foreground text-pretty md:text-2xl"
            >
              {body}
            </p>
          </Reveal>
        ) : null}
        {cta ? (
          <Reveal transition={{ delay: 0.18 }}>
            <div className="mt-12">
              <Button asChild size="lg" className="px-8 text-base">
                <a href={cta.href}>{cta.label}</a>
              </Button>
            </div>
          </Reveal>
        ) : null}
        {contact ? (
          <Reveal transition={{ delay: 0.24 }}>
            <p
              data-slot="contact"
              className="mt-10 font-mono text-sm tracking-wide text-muted-foreground md:text-base"
            >
              {contact}
            </p>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

export const ClosingCTADemo: ClosingCTAProps = {
  eyebrow: 'The ask',
  statement: 'Help us put the field on the map',
  body: 'We are raising a $12M Series A to expand from utilities into construction, logistics, and emergency response.',
  cta: { label: 'Talk to us', href: '#' },
  contact: 'ada@northwind.io',
  progress: { current: 6, total: 6 },
  footer: 'Northwind — Series A',
};
