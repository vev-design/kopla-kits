import { Button } from '@/components/ui/button';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';
import { cn } from '@/lib/utils';
import { archetypeSlots } from './archetype-slots';

/**
 * The ask and sign-off. A final statement, one action and a contact line,
 * landed on a contrast band or closed quietly. The brand's device renders
 * through the `heroDevice` slot and its frame through `pageFrame`
 * (archetype-slots.tsx).
 */
export interface ProposalClosingProps extends SectionBaseProps {
  /** Small label above the statement. 1–4 words; omit for none. */
  eyebrow?: string | null;
  /** The ask, in one line. 3–10 words, no trailing period. */
  statement: string;
  /** What happens next. 1–2 sentences, 15–45 words; omit for none. */
  body?: string | null;
  /** The one action. Omit when there is none. */
  cta?: {
    /** Visible label. 2–4 words. */
    label: string;
    /** Destination. @kind url */
    href: string;
  } | null;
  /** Contact line under the action, e.g. a name and address. Max 60 characters; omit for none. */
  contact?: string | null;
  /** Landing; defaults to contrast. */
  variant?: 'contrast' | 'quiet';
  /** Vertical padding; defaults to spacious. */
  spacing?: 'compact' | 'default' | 'spacious';
  /** Alignment; defaults to left. */
  align?: 'left' | 'center';
}

const SPACING = {
  compact: 'py-12 md:py-16',
  default: 'py-20 md:py-28',
  spacious: 'py-28 md:py-40',
} as const;
type Spacing = keyof typeof SPACING;

export function ProposalClosing({
  id,
  eyebrow,
  statement,
  body,
  cta,
  contact,
  variant = 'contrast',
  spacing = 'spacious',
  align = 'left',
}: ProposalClosingProps) {
  const content = (
    <div className={cn('relative mx-auto w-full max-w-5xl px-6 md:px-10', align === 'center' && 'text-center')}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {archetypeSlots.heroDevice?.({ variant }) ?? null}
      </div>
      <Reveal>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{eyebrow}</p> : null}
        <h2 className="mt-5 text-4xl font-bold leading-[0.98] tracking-tight text-balance md:text-6xl lg:text-7xl">{statement}</h2>
        {body ? <p className={cn('mt-7 max-w-2xl text-lg leading-relaxed md:text-xl', align === 'center' && 'mx-auto')}>{body}</p> : null}
      </Reveal>
      {cta || contact ? (
        <Reveal delay={0.1} className={cn('mt-10 flex flex-wrap items-center gap-6', align === 'center' && 'justify-center')}>
          {cta ? (
            <Button asChild size="lg" variant={variant === 'contrast' ? 'secondary' : 'default'}>
              <a href={cta.href}>{cta.label}</a>
            </Button>
          ) : null}
          {contact ? <p className="text-sm opacity-80">{contact}</p> : null}
        </Reveal>
      ) : null}
    </div>
  );
  return (
    <section
      id={id ?? undefined}
      className={cn('w-full', variant === 'contrast' ? 'bg-foreground text-background' : 'bg-background text-foreground', SPACING[spacing as Spacing])}
    >
      {archetypeSlots.pageFrame?.(content) ?? content}
    </section>
  );
}

export const ProposalClosingDemo: ProposalClosingProps = {
  id: 'ask',
  eyebrow: 'The ask',
  statement: 'Approve a discovery phase to validate the problem',
  body: 'The next proposal would name an accountable owner, estimate staffing and delivery costs, and set measurable success targets before development begins.',
  cta: { label: 'Discuss the discovery phase', href: '#top' },
  contact: 'Illustrative contact, fictional scenario',
  variant: 'contrast',
};
