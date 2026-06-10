import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * An oversized centered quote that punctuates the read — the place where
 * the eye rests and the argument lands. Use sparingly between body beats,
 * never more than once or twice in a piece. A crimson rule and a large
 * serif quote mark do the only decoration; the line itself carries it.
 */
export interface PullQuoteProps extends SectionBaseProps {
  /** The quoted line. 1 sentence, 8–24 words. Punchy and self-contained. */
  quote: string;
  /** Optional attribution. 2–5 words; person and/or role (e.g. "Maren Lindqvist, editor"). */
  attribution?: string | null;
}

export function PullQuote({ id, quote, attribution }: PullQuoteProps) {
  return (
    <section
      id={id ?? undefined}
      className="w-full bg-background px-6 py-20 md:py-28"
    >
      <Reveal className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <span
          className="font-serif text-7xl leading-none font-bold text-primary md:text-8xl"
          aria-hidden
        >
          &ldquo;
        </span>
        <blockquote className="mt-4 font-serif text-3xl leading-[1.25] font-semibold tracking-[-0.01em] text-balance text-foreground md:text-5xl">
          {quote}
        </blockquote>
        {attribution ? (
          <div className="mt-8 flex items-center gap-3">
            <span className="h-px w-8 bg-primary" aria-hidden />
            <cite className="font-sans text-sm tracking-[0.18em] text-muted-foreground uppercase not-italic">
              {attribution}
            </cite>
          </div>
        ) : null}
      </Reveal>
    </section>
  );
}

export const PullQuoteDemo: PullQuoteProps = {
  quote: 'We never lost the reader. We lost faith that the reader would wait.',
  attribution: 'Maren Lindqvist, editor',
};
