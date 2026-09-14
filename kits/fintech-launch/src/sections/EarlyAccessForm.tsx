import { Badge } from '@/components';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * A focused early-access signup stage for a launch page, pairing a bold promise
 * with a simple native email form and a clear, in-place confirmation state.
 */
export interface EarlyAccessFormProps extends SectionBaseProps {
  /** Compact launch label. 1–4 words, uppercase or title case. */
  eyebrow?: string | null;
  /** Conversion statement. 4–10 words, no trailing period. */
  headline: string;
  /** Supporting explanation. 1–2 sentences, 14–30 words. */
  body?: string | null;
  /** Capture endpoint for this signup form. */
  /** @kind formAction */
  action: string;
  /** Visible submit label. 1–4 words, imperative sentence case. */
  submitLabel: string;
  /** Short privacy or timing reassurance. 5–16 words. */
  finePrint?: string | null;
  /** Confirmation headline shown after a successful submission. 2–6 words, no trailing period. */
  successHeadline: string;
  /** Confirmation sentence shown after a successful submission. 10–24 words. */
  successBody: string;
  /** Error sentence shown if the form cannot be delivered. 7–18 words. */
  errorMessage?: string | null;
  /** Color treatment for the signup stage. */
  variant?: 'dark' | 'light';
}

export function EarlyAccessForm({
  id,
  eyebrow,
  headline,
  body,
  action,
  submitLabel,
  finePrint,
  successHeadline,
  successBody,
  errorMessage = "That didn't send — please try again.",
  variant = 'dark',
}: EarlyAccessFormProps) {
  const dark = variant === 'dark';
  const panelClass = dark
    ? 'bg-[var(--dark)] text-primary-foreground'
    : 'bg-background text-foreground';
  const inputClass = dark
    ? 'border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-primary-foreground'
    : 'border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary';

  return (
    <section id={id ?? undefined} className={cn('px-5 py-28 sm:px-8 lg:px-12 lg:py-40', panelClass)}>
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow ? <Badge label={eyebrow} variant={dark ? 'subtle' : 'dark'} className={dark ? 'bg-primary-foreground/10 text-primary-foreground' : ''} /> : null}
        <h2 className="mt-5 text-[clamp(3.2rem,8vw,8.5rem)] font-semibold leading-[.9] tracking-[-.02em]">{headline}</h2>
        {body ? <p className="mx-auto mt-6 max-w-xl text-lg leading-7 opacity-70">{body}</p> : null}
        <form method="post" action={action} className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row" data-kopla-form-state="idle">
          <label className="sr-only" htmlFor={`${id ?? 'early-access'}-email`}>Email address</label>
          <input id={`${id ?? 'early-access'}-email`} name="email" type="email" autoComplete="email" required placeholder="Work email address" className={cn('h-14 min-w-0 flex-1 rounded-lg border px-5 text-base outline-none transition-colors', inputClass)} />
          <input type="text" name="_kopla_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }} />
          <button type="submit" className={dark ? 'h-14 rounded-lg bg-primary-foreground px-7 text-sm font-semibold text-primary transition-opacity hover:opacity-85' : 'h-14 rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-85'}>{submitLabel}</button>
        </form>
        {finePrint ? <p className="mt-4 text-sm opacity-55">{finePrint}</p> : null}
        <div data-kopla-form-success hidden className="mx-auto mt-10 max-w-xl rounded-xl border border-current/15 p-8 text-left">
          <h3 className="text-2xl font-semibold tracking-[-.01em]">{successHeadline}</h3>
          <p className="mt-3 leading-6 opacity-70">{successBody}</p>
        </div>
        <div data-kopla-form-error hidden className="mx-auto mt-10 max-w-xl rounded-xl border border-current/15 p-6 text-left text-sm opacity-80">{errorMessage}</div>
      </div>
    </section>
  );
}

export const EarlyAccessFormDemo: EarlyAccessFormProps = {
  id: 'early-access',
  eyebrow: 'Early access',
  headline: 'Get the first look',
  body: 'Join the founders building a clearer financial operating system for their next stage of growth.',
  action: '/__kopla/forms/early-access',
  submitLabel: 'Join the list',
  finePrint: 'No spam. A short note when doors open.',
  successHeadline: 'You are on the list',
  successBody: 'Thanks for joining us. We will be in touch with your early-access invitation shortly.',
  variant: 'dark',
};
