import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * The closing project enquiry — the loudest type on the page. One oversized
 * headline, a contact email, and a single accent call-to-action, on an
 * inverted near-black band. Place just before the footer.
 */
export interface ContactCTAProps extends SectionBaseProps {
  /** Monospace label above the headline. 1–3 words, sentence case, no punctuation (e.g. "Start a project"). */
  eyebrow?: string | null;
  /** Oversized closing statement. 1 phrase, 3–7 words, no trailing period. */
  headline: string;
  /** Contact email address, shown as a mailto link. Plain email, no display name. */
  email: string;
  /** Primary action button. */
  cta: {
    /** Button label. 2–3 words, sentence case (e.g. "Start a project"). */
    label: string;
    /**
     * Destination the button links to (often a mailto: or contact form).
     * @kind url
     */
    href: string;
  };
}

export function ContactCTA({ id, eyebrow, headline, email, cta }: ContactCTAProps) {
  return (
    <section id={id ?? undefined} className="w-full border-b border-foreground bg-foreground text-background">
      <div className="mx-auto w-full max-w-7xl px-6 py-24 md:py-32">
        <Reveal className="flex flex-col gap-12">
          {eyebrow ? (
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-background/60">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="max-w-5xl text-5xl font-bold leading-[0.95] tracking-[-0.03em] text-balance uppercase sm:text-7xl md:text-8xl">
            {headline}
          </h2>
          <div className="flex flex-col items-start gap-6 border-t border-background/20 pt-8 md:flex-row md:items-center md:justify-between">
            <a
              href={`mailto:${email}`}
              className="text-xl font-medium underline decoration-primary decoration-2 underline-offset-8 transition-colors hover:text-primary md:text-2xl"
            >
              {email}
            </a>
            <Button
              asChild
              size="lg"
              className="rounded-sm font-mono text-xs uppercase tracking-[0.14em]"
            >
              <a href={cta.href}>
                {cta.label}
                <ArrowUpRight />
              </a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export const ContactCTADemo: ContactCTAProps = {
  eyebrow: 'Start a project',
  headline: 'Got something to build',
  email: 'hello@fieldstudio.example',
  cta: { label: 'Start a project', href: 'mailto:hello@fieldstudio.example' },
};
