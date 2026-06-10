import { Reveal } from '@/motion';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * Full-screen pull-quote slide: one large quotation and an attribution line.
 * An intimate, type-led beat that slows the pace and carries credibility in a
 * human voice — a customer, an investor, or the founder. One quote per slide.
 */
export interface QuoteSlideProps extends SectionBaseProps {
  /** The quotation, without surrounding quote marks. 1–3 sentences, 12–40 words. */
  quote: string;
  /** Who said it. 2–5 words (e.g. "Grace Hopper"). */
  attributionName: string;
  /** Their role / company. 2–8 words, sentence case, no trailing period. */
  attributionRole?: string | null;
  /** Text alignment for the quote block. */
  variant?: 'centered' | 'left';
}

export function QuoteSlide({
  id,
  quote,
  attributionName,
  attributionRole,
  variant = 'centered',
}: QuoteSlideProps) {
  return (
    <section
      id={id ?? undefined}
      className={cn(
        'flex min-h-screen w-full flex-col justify-center bg-card px-6 py-24 md:px-16',
        variant === 'centered' && 'items-center text-center',
      )}
    >
      <div
        className={cn(
          'mx-auto w-full',
          variant === 'centered' ? 'max-w-4xl' : 'max-w-5xl',
        )}
      >
        <Reveal>
          <span
            aria-hidden
            className="block font-display text-7xl leading-none font-bold text-primary md:text-9xl"
          >
            &ldquo;
          </span>
        </Reveal>
        <Reveal transition={{ delay: 0.08 }}>
          <blockquote className="mt-2 font-display text-3xl leading-tight font-medium tracking-tight text-balance md:text-5xl lg:text-6xl">
            {quote}
          </blockquote>
        </Reveal>
        <Reveal transition={{ delay: 0.16 }}>
          <footer
            className={cn(
              'mt-12 flex flex-col gap-1',
              variant === 'centered' && 'items-center',
            )}
          >
            <span className="text-lg font-semibold tracking-tight md:text-xl">
              {attributionName}
            </span>
            {attributionRole ? (
              <span className="text-base text-muted-foreground md:text-lg">
                {attributionRole}
              </span>
            ) : null}
          </footer>
        </Reveal>
      </div>
    </section>
  );
}

export const QuoteSlideDemo: QuoteSlideProps = {
  quote:
    'We cancelled three other tools the week we switched. The dispatch board alone paid for itself in a month.',
  attributionName: 'Marcus Reyes',
  attributionRole: 'Operations Director, Veridian Utilities',
  variant: 'centered',
};
