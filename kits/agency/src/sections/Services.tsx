import { Reveal, Stagger } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * A numbered capabilities list with monospace indices and hairline grid rules
 * — the studio's contents page. Each row pairs an index, a short title, and a
 * one-line description. Use early to answer "what do you do" and set the
 * editorial rhythm.
 */
export interface ServicesProps extends SectionBaseProps {
  /** Monospace label above the heading. 1–3 words, sentence case, no punctuation (e.g. "Capabilities"). */
  eyebrow?: string | null;
  /** Section heading. 1 phrase, 2–6 words, no trailing period. */
  heading: string;
  /** Capability rows. 3–6 items; indices render as zero-padded "01", "02", … automatically. */
  services: {
    /** Capability title. 1–2 words, sentence case (e.g. "Brand identity"). */
    title: string;
    /** What the capability covers. 1 sentence, 10–22 words. */
    description: string;
  }[];
}

export function Services({ id, eyebrow, heading, services }: ServicesProps) {
  return (
    <section id={id ?? undefined} className="w-full border-b border-foreground bg-background">
      <div className="mx-auto w-full max-w-7xl px-6 py-20 md:py-28">
        <Reveal className="mb-14 flex flex-col gap-4">
          {eyebrow ? (
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="max-w-3xl text-4xl font-bold tracking-[-0.02em] text-balance uppercase md:text-6xl">
            {heading}
          </h2>
        </Reveal>
        <Stagger className="border-t border-border">
          {services.map((service, i) => (
            <div
              key={service.title}
              className="grid grid-cols-1 gap-3 border-b border-border py-8 transition-colors hover:bg-secondary/60 md:grid-cols-[5rem_1fr_1.2fr] md:items-baseline md:gap-8"
            >
              <span className="font-mono text-sm text-primary">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="text-2xl font-bold tracking-tight md:text-3xl">
                {service.title}
              </h3>
              <p className="max-w-xl text-base text-muted-foreground text-pretty">
                {service.description}
              </p>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export const ServicesDemo: ServicesProps = {
  eyebrow: 'Capabilities',
  heading: 'What we do',
  services: [
    {
      title: 'Brand',
      description:
        'Naming, identity systems, and guidelines that give a company a voice it can actually defend.',
    },
    {
      title: 'Web',
      description:
        'Design and build for sites and product surfaces, from a one-page launch to a full design system.',
    },
    {
      title: 'Motion',
      description:
        'Title sequences, product animation, and social cuts that make a static brand move with intent.',
    },
    {
      title: 'Strategy',
      description:
        'Positioning, messaging, and research that decide what to say before we decide how it looks.',
    },
  ],
};
