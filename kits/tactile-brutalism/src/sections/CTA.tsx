import { Button } from '@/components/Button';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Full-width closing statement: a viewport-scaled line of type and a single
 * solid acid-lime button, set inside an inverted lime band so it reads as
 * the loudest moment on the page. Always the second-to-last section, right
 * before the footer.
 */
export interface CTAProps extends SectionBaseProps {
  /** Closing statement. 1 short sentence or fragment, 4–9 words, no trailing period. */
  headline: string;
  /** Supporting line under the headline. 1 sentence, 10–22 words. Omit for a headline-only band. */
  support?: string | null;
  /** The single call-to-action button. */
  cta: {
    /** Button label. 1–3 words, sentence case (e.g. "Start a project"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  };
}

export function CTA({ id, headline, support, cta }: CTAProps) {
  return (
    <section id={id ?? undefined} className="w-full border-b border-border bg-primary">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-8 px-6 py-24 text-primary-foreground md:py-32">
        <Reveal className="flex flex-col items-start gap-6">
          <h2 className="max-w-3xl text-[clamp(2.25rem,7vw,5rem)] leading-[0.95] font-black tracking-tight text-balance uppercase">
            {headline}
          </h2>
          {support ? (
            <p className="max-w-xl text-lg text-primary-foreground/70 text-pretty">{support}</p>
          ) : null}
          <Button asChild size="lg" variant="ghost" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
            <a href={cta.href}>{cta.label}</a>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

export const CTADemo: CTAProps = {
  headline: 'Bring us the rough sketch',
  support: 'We handle tolerancing, tooling, and the ten revisions in between.',
  cta: { label: 'Start a project', href: '#top' },
};
