import { Button } from '@/components';
import type { SectionBaseProps } from '@/types';

/** A full-width final invitation that gives an otherwise dense business page one unmistakable next step. */
export interface ClosingCtaProps extends SectionBaseProps {
  /** Optional compact category label. 1–3 words. */ eyebrow?: string | null;
  /** Closing statement. 4–10 words, no trailing period. */ headline: string;
  /** Short supporting line. 1 sentence, 10–22 words. */ body?: string | null;
  /** Primary conversion action. */ action: { label: string; /** @kind url */ href: string };
  /** Color treatment for the closing stage. */ variant?: 'dark' | 'light';
}
export function ClosingCta({ id, eyebrow, headline, body, action, variant = 'dark' }: ClosingCtaProps) { const dark = variant === 'dark'; return <section id={id ?? undefined} className={dark ? 'bg-[var(--dark)] px-5 py-28 text-primary-foreground sm:px-8 lg:px-12 lg:py-40' : 'bg-background px-5 py-28 text-foreground sm:px-8 lg:px-12 lg:py-40'}><div className="mx-auto max-w-4xl text-center"><p className="text-xs font-semibold uppercase tracking-[.12em] opacity-60">{eyebrow}</p><h2 className="mt-5 text-[clamp(3.2rem,8vw,8.5rem)] font-semibold leading-[.9] tracking-[-.02em]">{headline}</h2>{body ? <p className="mx-auto mt-6 max-w-xl text-lg leading-7 opacity-70">{body}</p> : null}<Button {...action} variant={dark ? 'light' : 'solid'} size="lg" className="mt-9" /></div></section>; }
export const ClosingCtaDemo: ClosingCtaProps = { id: 'start', eyebrow: 'Business finance, simplified', headline: 'Ready for less admin?', body: 'Open a Qonto account and put your business finance in motion today.', action: { label: 'Open an account', href: '#' }, variant: 'dark' };
