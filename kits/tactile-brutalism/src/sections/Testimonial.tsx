import { Card } from '@/components/Card';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * A single raw blockquote: an oversized quotation mark, the quote itself set
 * in large type, and a mono attribution line — no card box, just a top rule.
 * Use as a credibility beat between the stat and the closing CTA.
 */
export interface TestimonialProps extends SectionBaseProps {
  /** The quote itself. 1–3 sentences, 20–50 words, no surrounding quote marks. */
  quote: string;
  /** Who said it. */
  author: {
    /** Full name. */
    name: string;
    /** Role and/or company. 2–6 words (e.g. "Ops Lead, Northfield"). */
    role: string;
  };
}

export function Testimonial({ id, quote, author }: TestimonialProps) {
  return (
    <section id={id ?? undefined} className="w-full border-b border-border bg-background">
      <div className="mx-auto w-full max-w-4xl px-6 py-24 md:py-32">
        <Reveal>
          <Card variant="ghost" className="items-start gap-8 p-0">
            <span aria-hidden className="font-display text-8xl leading-none font-black text-primary">
              &ldquo;
            </span>
            <p className="text-2xl leading-snug font-medium text-pretty md:text-3xl">
              {quote}
            </p>
            <p className="font-mono text-sm tracking-[0.08em] text-muted-foreground uppercase">
              {author.name} — {author.role}
            </p>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

export const TestimonialDemo: TestimonialProps = {
  quote:
    'Monolith turned a napkin sketch into a tolerance-checked enclosure in six weeks. No polish, no fluff in the process — just parts that fit the first time.',
  author: { name: 'Dana Okafor', role: 'Hardware Lead, Northfield' },
};
