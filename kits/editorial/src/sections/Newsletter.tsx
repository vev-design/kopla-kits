import { Button } from '@/components/ui/button';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * A quiet subscribe block that turns the read outward: an eyebrow, a
 * serif headline, a line of reassurance, and a single email capture
 * field with a button. Place near the end of the piece, before the
 * Footer. The form is presentational — wire `action` to a real endpoint
 * downstream if needed.
 */
export interface NewsletterProps extends SectionBaseProps {
  /** Eyebrow above the headline. 1–3 words, Title Case (e.g. "Stay With Us"). */
  eyebrow?: string | null;
  /** Headline inviting the reader to subscribe. 3–8 words, no trailing period. */
  headline: string;
  /** Supporting line under the headline. 1 sentence, 10–24 words. */
  body?: string | null;
  /** Placeholder shown in the email field. Max 28 characters (e.g. "you@example.com"). */
  placeholder?: string | null;
  /** Submit button label. 1–2 words, sentence case (e.g. "Subscribe"). */
  buttonLabel: string;
  /**
   * Optional form submission endpoint.
   * @kind url
   */
  action?: string | null;
}

export function Newsletter({
  id,
  eyebrow,
  headline,
  body,
  placeholder = 'you@example.com',
  buttonLabel,
  action,
}: NewsletterProps) {
  return (
    <section
      id={id ?? undefined}
      className="w-full border-y border-border bg-secondary px-6 py-20 md:py-28"
    >
      <Reveal className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        {eyebrow ? (
          <p className="font-sans text-xs font-semibold tracking-[0.24em] text-primary uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-4 font-serif text-4xl leading-tight font-bold tracking-[-0.01em] text-balance text-foreground md:text-5xl">
          {headline}
        </h2>
        {body ? (
          <p className="mt-5 max-w-xl font-sans text-lg leading-relaxed text-muted-foreground text-pretty">
            {body}
          </p>
        ) : null}
        <form
          action={action ?? undefined}
          className="mt-9 flex w-full max-w-md flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            name="email"
            required
            placeholder={placeholder ?? undefined}
            aria-label="Email address"
            className="h-11 w-full flex-1 rounded-md border border-input bg-background px-4 font-sans text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
          />
          <Button type="submit" size="lg" className="h-11 shrink-0">
            {buttonLabel}
          </Button>
        </form>
      </Reveal>
    </section>
  );
}

export const NewsletterDemo: NewsletterProps = {
  eyebrow: 'Stay With Us',
  headline: 'One long story, every Sunday',
  body: 'No feed, no notifications. Just a single piece worth your morning, sent the day it ships.',
  placeholder: 'you@example.com',
  buttonLabel: 'Subscribe',
  action: '#',
};
