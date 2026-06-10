import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * Top-of-page banner with one strong visual statement and an optional CTA.
 * Use as the first section above the fold.
 */
export interface HeroProps extends SectionBaseProps {
  /** Short uppercase label rendered above the headline. 1–3 words, no punctuation. */
  eyebrow?: string | null;
  /** Primary statement. 1 sentence, 4–10 words, no trailing period. */
  headline: string;
  /** Supporting sentence under the headline. 1–2 sentences, 12–28 words. */
  body?: string | null;
  /** Optional call-to-action button. Omit for a pure-statement hero. */
  cta?: {
    /** Visible button label. 1–3 words, sentence case (e.g. "Get started"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  } | null;
  /** Layout variant. `centered` is the default presentation hero; `left` is more editorial. */
  variant?: 'centered' | 'left';
}

export function Hero({
  id,
  eyebrow,
  headline,
  body,
  cta,
  variant = 'centered',
}: HeroProps) {
  return (
    <section
      id={id ?? undefined}
      className={cn(
        'mx-auto w-full max-w-6xl px-6 py-24 md:py-32',
        variant === 'centered' ? 'text-center' : 'text-left',
      )}
    >
      <div
        className={cn(
          'flex flex-col gap-6',
          variant === 'centered' && 'items-center',
        )}
      >
        {eyebrow ? (
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
          {headline}
        </h1>
        {body ? (
          <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
            {body}
          </p>
        ) : null}
        {cta ? (
          <div className="mt-2">
            <Button asChild size="lg">
              <a href={cta.href}>{cta.label}</a>
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export const HeroDemo: HeroProps = {
  eyebrow: 'Design system',
  headline: 'shadcn primitives, ready to skin.',
  body: 'Theme tokens live in src/globals.css. Add components with `npm run ui:add <name>`, build sections in src/sections/, and rebuild.',
  cta: { label: 'Read the spec', href: '#' },
  variant: 'centered',
};
