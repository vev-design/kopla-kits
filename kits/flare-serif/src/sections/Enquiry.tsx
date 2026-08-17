import { Reveal } from '@/motion';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components';
import type { SectionBaseProps } from '@/types';

/**
 * The closing ask, set as the largest all-caps block on the page — the system
 * ends the way it opened, with the face at full size and nothing competing.
 * The accent appears here on the primary action and nowhere else in the
 * section, which is the whole colour budget spent in one place.
 *
 * @hydrate
 */
export interface EnquiryProps extends SectionBaseProps {
  /** Tracked caps label. 1–3 words. */
  eyebrow?: string | null;
  /** The closing statement. 2–6 words, no trailing period. */
  headline: string;
  /** Supporting line. 1 sentence, 12–28 words, no trailing period. */
  body?: string | null;
  /** Primary action. */
  cta: {
    /** Button label. 1–3 words, sentence case (e.g. "Request a trial"). */
    label: string;
    /**
     * Destination.
     * @kind url
     */
    href: string;
  };
  /** Secondary action, shown as a quiet text link beside the button. */
  secondary?: {
    /** Link label. 1–3 words, sentence case. */
    label: string;
    /**
     * Destination.
     * @kind url
     */
    href: string;
  } | null;
}

export function Enquiry({ id, eyebrow, headline, body, cta, secondary }: EnquiryProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background py-28 md:py-40">
      <Reveal className="mx-auto w-full max-w-7xl px-6">
        {eyebrow ? <Eyebrow className="mb-10">{eyebrow}</Eyebrow> : null}
        <h2 className="font-display text-[clamp(2.5rem,11vw,9rem)] leading-[0.9] font-black text-foreground uppercase [letter-spacing:var(--tracking-caps)]">
          {headline}
        </h2>
        {body ? (
          <p className="measure mt-10 font-sans text-lg leading-relaxed text-muted-foreground text-pretty">
            {body}
          </p>
        ) : null}
        <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4">
          <Button asChild size="lg" className="h-12 px-8 text-[0.6875rem] font-semibold uppercase [letter-spacing:var(--tracking-label)]">
            <a href={cta.href}>{cta.label}</a>
          </Button>
          {secondary ? (
            <a
              href={secondary.href}
              className="font-sans text-[0.6875rem] font-semibold uppercase [letter-spacing:var(--tracking-label)] text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline"
            >
              {secondary.label}
            </a>
          ) : null}
        </div>
      </Reveal>
    </section>
  );
}

export const EnquiryDemo: EnquiryProps = {
  eyebrow: 'License',
  headline: 'Set it yourself',
  body: 'Trial the full family for thirty days at no cost, with every weight, both scripts and all four stylistic sets unlocked',
  cta: { label: 'Request a trial', href: '#' },
  secondary: { label: 'Download specimen', href: '#' },
};
