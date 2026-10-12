import { MediaBlock, type ImageBlockProps } from '@/components/blocks';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';
import { cn } from '@/lib/utils';
import { archetypeSlots } from './archetype-slots';

/**
 * A standout quotation with attribution and an optional portrait. The brand's
 * decoration around the words and its framing of the portrait arrive through
 * the `quoteDecoration` and `portraitFrame` slots (archetype-slots.tsx).
 */
export interface QuoteProps extends SectionBaseProps {
  /** The quotation, without surrounding quote marks. 1–3 sentences, 12–45 words. */
  quote: string;
  /** Who said it. 2–5 words. */
  name: string;
  /** Their role or organisation. 2–8 words; omit for none. */
  role?: string | null;
  /** Portrait of the speaker; omit for none. */
  image?: ImageBlockProps | null;
  /** The moment or a quieter beat; defaults to standout. */
  variant?: 'standout' | 'editorial';
  /** Band treatment; defaults to default. */
  background?: 'default' | 'muted' | 'accent' | 'inverse';
  /** Vertical padding; defaults to default. */
  spacing?: 'compact' | 'default' | 'spacious';
  /** Alignment of the standout variant; defaults to center. */
  align?: 'left' | 'center';
}

const BACKGROUND = {
  default: 'bg-background text-foreground',
  muted: 'bg-muted text-foreground',
  accent: 'bg-primary text-primary-foreground',
  inverse: 'bg-foreground text-background',
} as const;
const SPACING = {
  compact: 'py-12 md:py-16',
  default: 'py-20 md:py-28',
  spacious: 'py-28 md:py-40',
} as const;
type Background = keyof typeof BACKGROUND;
type Spacing = keyof typeof SPACING;

export function Quote({
  id,
  quote,
  name,
  role,
  image,
  variant = 'standout',
  background = 'default',
  spacing = 'default',
  align = 'center',
}: QuoteProps) {
  const portrait = image ? (
    <div className="size-16 shrink-0 overflow-clip rounded-full [&_img]:size-full [&_img]:object-cover md:size-20">
      <MediaBlock media={image} />
    </div>
  ) : null;
  const framedPortrait = portrait ? (archetypeSlots.portraitFrame?.(portrait) ?? portrait) : null;
  const attribution = (
    <div className={cn('flex items-center gap-4', variant === 'standout' && align === 'center' && 'justify-center')}>
      {framedPortrait}
      <div className="text-left">
        <p className="text-sm font-semibold uppercase tracking-[0.14em]">{name}</p>
        {role ? <p className="mt-1 text-sm opacity-70">{role}</p> : null}
      </div>
    </div>
  );
  return (
    <section id={id ?? undefined} className={cn('w-full', BACKGROUND[background as Background], SPACING[spacing as Spacing])}>
      <div className={cn('mx-auto w-full max-w-5xl px-6 md:px-10', variant === 'standout' && align === 'center' && 'text-center')}>
        <figure className={cn('relative', variant === 'editorial' && 'grid gap-8 md:grid-cols-[1fr_3fr] md:items-center')}>
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            {archetypeSlots.quoteDecoration?.({ variant }) ?? null}
          </div>
          {variant === 'editorial' ? <div className="flex md:justify-end">{framedPortrait}</div> : null}
          <div>
            <Reveal>
              <blockquote
                className={cn(
                  'font-medium leading-tight tracking-tight text-balance',
                  variant === 'standout' ? 'text-3xl md:text-5xl lg:text-6xl' : 'text-2xl md:text-3xl',
                )}
              >
                “{quote}”
              </blockquote>
            </Reveal>
            <Reveal delay={0.1} className="mt-8">
              {variant === 'editorial' ? (
                <div className="text-left">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em]">{name}</p>
                  {role ? <p className="mt-1 text-sm opacity-70">{role}</p> : null}
                </div>
              ) : (
                attribution
              )}
            </Reveal>
          </div>
        </figure>
      </div>
    </section>
  );
}

export const QuoteDemo: QuoteProps = {
  id: 'quote',
  quote: 'We spend the first week of every quarter assembling reports that disagree with each other before anyone can ask a question about the business.',
  name: 'Illustrative enterprise customer',
  role: 'Head of operations, fictional scenario',
  variant: 'standout',
};
