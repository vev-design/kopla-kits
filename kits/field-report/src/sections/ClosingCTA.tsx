import { EditorialButton, SectionKicker } from '@/components';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * A calm final call-to-action for a long-form sustainability story. Use last to turn the report’s evidence into a clear next conversation.
 */
export interface ClosingCTAProps extends SectionBaseProps {
  /** Closing eyebrow. 1–3 title-case words. */
  kicker: string;
  /** Final statement. 4–12 words, no trailing period. */
  headline: string;
  /** Supporting invitation. 1–2 sentences, 18–36 words. */
  body: string;
  /** Primary reader action. */
  cta: { /** Visible label. 1–4 words. */ label: string; /** Destination. @kind url */ href: string };
  /** Background treatment. */
  variant?: 'ink' | 'lavender';
}

export function ClosingCTA({ id, kicker, headline, body, cta, variant = 'ink' }: ClosingCTAProps) {
  const ink = variant === 'ink';
  return <section id={id ?? undefined} className={`${ink ? 'bg-primary text-background' : 'bg-[var(--lavender)] text-background'} px-5 py-28 md:px-10 md:py-40`}><Reveal><div className="mx-auto max-w-6xl"><SectionKicker tone="light">{kicker}</SectionKicker><div className="mt-20 grid gap-12 md:grid-cols-12"><h2 className="font-display text-6xl leading-[.9] tracking-[-.065em] md:col-span-8 md:text-9xl">{headline}</h2><div className="self-end md:col-span-3 md:col-start-10"><p className="text-xl leading-relaxed">{body}</p><div className="mt-10"><EditorialButton variant="light" label={cta.label} href={cta.href} /></div></div></div></div></Reveal></section>;
}

export const ClosingCTADemo: ClosingCTAProps = { kicker: 'The next loop', headline: 'Keep carbon in the conversation', body: 'A cleaner carbon story begins with the materials we choose to value, recover and reuse.', cta: { label: 'Read the outlook', href: '#' }, variant: 'ink' };
