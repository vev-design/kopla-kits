import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/Badge';
import type { SectionBaseProps } from '@/types';

/**
 * The closing beat — a quiet sign-off that ends the report. A short thank-you
 * statement, an optional call-to-action to the full filing, and a generic
 * forward-looking-statements disclaimer set in fine print. Use as the final
 * section of the document.
 */
export interface ClosingProps extends SectionBaseProps {
  /** Small label above the statement. 1–4 words, no punctuation (e.g. "In closing"). */
  eyebrow?: string | null;
  /** Closing statement / thank-you. 1–2 sentences, 12–34 words. */
  statement: string;
  /** Optional sign-off line under the statement. 2–6 words (e.g. "The Board of Directors"). */
  signoff?: string | null;
  /** Optional call-to-action to the full report or filing. */
  cta?: {
    /** Button label. 1–4 words, sentence case (e.g. "Read the full report"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  } | null;
  /** Forward-looking-statements disclaimer, fine print. 1–3 sentences, 30–70 words. */
  disclaimer?: string | null;
}

export function Closing({
  id,
  eyebrow,
  statement,
  signoff,
  cta,
  disclaimer,
}: ClosingProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background">
      <div className="mx-auto w-full max-w-4xl px-6 py-28 text-center md:px-12 md:py-36">
        <Reveal className="flex flex-col items-center gap-8">
          {eyebrow ? <Badge variant="rule">{eyebrow}</Badge> : null}
          <p className="max-w-2xl font-serif text-3xl font-medium leading-snug tracking-tight text-balance md:text-4xl">
            {statement}
          </p>
          {signoff ? (
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {signoff}
            </span>
          ) : null}
          {cta ? (
            <Button asChild size="lg" className="mt-2">
              <a href={cta.href}>
                {cta.label}
                <ArrowRight />
              </a>
            </Button>
          ) : null}
        </Reveal>

        {disclaimer ? (
          <Reveal>
            <p className="mx-auto mt-20 max-w-2xl border-t border-border pt-8 text-xs leading-relaxed text-muted-foreground text-pretty">
              {disclaimer}
            </p>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

export const ClosingDemo: ClosingProps = {
  eyebrow: 'In closing',
  statement:
    'Thank you to our shareholders, customers, and colleagues for the trust that made this year possible.',
  signoff: 'The Board of Directors',
  cta: { label: 'Read the full report', href: '#' },
  disclaimer:
    'This report contains forward-looking statements that reflect current expectations and are subject to risks and uncertainties. Actual results may differ materially. The company undertakes no obligation to update any forward-looking statement except as required by law.',
};
