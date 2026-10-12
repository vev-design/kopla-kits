import { Button } from '@/components/ui/button';
import { MediaBlock, type ImageBlockProps } from '@/components/blocks';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';
import { cn } from '@/lib/utils';
import { archetypeSlots } from './archetype-slots';

/**
 * The opening beat of a proposal or report: a title, one line of why, a short
 * introduction and an optional action. `variant` picks what carries it — the
 * type alone, a full-bleed image, or one focal figure. The brand's device
 * renders through the `heroDevice` slot behind the title and the `pageFrame`
 * slot around the band (archetype-slots.tsx).
 */
export interface ProposalHeroProps extends SectionBaseProps {
  /** Small label above the title. 2–6 words, e.g. "Business proposal · 2026". */
  eyebrow?: string | null;
  /** The proposal's name. 2–6 words. */
  title: string;
  /** The one-line why. 4–12 words, no trailing period. */
  subtitle: string;
  /** Introduction. 2–3 sentences, 35–75 words. */
  body: string;
  /** Qualification or scope note under the introduction. 1–3 sentences; omit when there is none. */
  note?: string | null;
  /** In-page or external action. Omit when the opening has no call. */
  cta?: {
    /** Visible label. 2–4 words. */
    label: string;
    /** Destination. @kind url */
    href: string;
  } | null;
  /** Full-bleed photograph for the `image` variant; ignored otherwise. */
  image?: ImageBlockProps | null;
  /** The one figure for the `figure` variant; ignored otherwise. */
  figure?: {
    /** The number with its unit, max 8 characters, e.g. "EUR 1.7m", "62%". */
    value: string;
    /** What it measures. 2–6 words. */
    label: string;
  } | null;
  /** What carries the opening; defaults to typographic. */
  variant?: 'typographic' | 'image' | 'figure';
  /** Band treatment; defaults to default. */
  background?: 'default' | 'muted' | 'accent' | 'inverse';
  /** Vertical breathing room; defaults to spacious. */
  spacing?: 'compact' | 'default' | 'spacious';
  /** Text alignment; defaults to left. */
  align?: 'left' | 'center';
  /** Remove the small label. */
  hideEyebrow?: boolean;
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

export function ProposalHero({
  id,
  eyebrow,
  title,
  subtitle,
  body,
  note,
  cta,
  image,
  figure,
  variant = 'typographic',
  background = 'default',
  spacing = 'spacious',
  align = 'left',
  hideEyebrow,
}: ProposalHeroProps) {
  const centered = align === 'center';
  const content = (
    <div className={cn('mx-auto w-full max-w-6xl px-6 md:px-10', centered && 'text-center')}>
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          {archetypeSlots.heroDevice?.({ variant }) ?? null}
        </div>
        <Reveal>
          {!hideEyebrow && eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{eyebrow}</p>
          ) : null}
          <h1 className="mt-6 text-5xl font-bold leading-[0.95] tracking-tight text-balance md:text-7xl lg:text-8xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-2xl leading-snug text-balance md:text-4xl">{subtitle}</p>
        </Reveal>
      </div>
      <div className={cn('mt-12 grid gap-10 md:grid-cols-[3fr_2fr]', centered && 'md:grid-cols-1 justify-items-center')}>
        <Reveal delay={0.08}>
          <p className="max-w-2xl text-lg leading-relaxed md:text-xl">{body}</p>
          {cta ? (
            <div className="mt-8">
              <Button asChild size="lg">
                <a href={cta.href}>{cta.label}</a>
              </Button>
            </div>
          ) : null}
        </Reveal>
        {variant === 'figure' && figure ? (
          <Reveal delay={0.14} className="self-end">
            <p className="text-6xl font-bold leading-none tracking-tight md:text-8xl">{figure.value}</p>
            <p className="mt-3 text-sm uppercase tracking-[0.16em] opacity-70">{figure.label}</p>
          </Reveal>
        ) : note ? (
          <Reveal delay={0.14} className="self-end">
            <p className="max-w-md border-t border-current/20 pt-4 text-sm leading-relaxed opacity-70">{note}</p>
          </Reveal>
        ) : null}
      </div>
      {variant === 'image' && image ? (
        <Reveal delay={0.2} className="mt-14 overflow-clip rounded-lg [&_img]:aspect-[21/9] [&_img]:w-full [&_img]:object-cover">
          <MediaBlock media={image} />
        </Reveal>
      ) : null}
    </div>
  );
  return (
    <section id={id ?? undefined} className={cn('w-full', BACKGROUND[background as Background], SPACING[spacing as Spacing])}>
      {archetypeSlots.pageFrame?.(content) ?? content}
    </section>
  );
}

export const ProposalHeroDemo: ProposalHeroProps = {
  id: 'top',
  eyebrow: 'Business proposal · Fictional scenario',
  title: 'Fjord Insights',
  subtitle: 'An enterprise reporting opportunity',
  body: 'We propose launching a reporting and planning offering for enterprise customers, bringing financial performance, product adoption and customer feedback into one shared experience with the underlying evidence close at hand.',
  note: 'This is a fictional company and demonstration dataset. All figures are scenario data rather than actual results or validated forecasts.',
  cta: { label: 'Explore the opportunity', href: '#opportunity' },
  variant: 'typographic',
};
