import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * A short bio paired with a list of capabilities or past clients. The
 * personal counterpoint to the work grid.
 */
export interface AboutProps extends SectionBaseProps {
  /** Section heading. 1–3 words, e.g. "About". */
  heading: string;
  /** Bio. 2–4 sentences, 35–80 words. */
  bio: string;
  /** Capabilities or services. 3–8 items, 1–3 words each. */
  capabilities?: string[] | null;
}

export function About({ id, heading, bio, capabilities }: AboutProps) {
  return (
    <section id={id ?? undefined} className="mx-auto w-full max-w-5xl px-6 py-16 md:py-24">
      <Reveal className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_1.4fr] md:gap-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">{heading}</h2>
        <div className="flex flex-col gap-8">
          <p className="text-lg leading-relaxed text-foreground/80 text-pretty">{bio}</p>
          {capabilities && capabilities.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {capabilities.map((cap, i) => (
                <li
                  key={i}
                  className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground"
                >
                  {cap}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Reveal>
    </section>
  );
}

export const AboutDemo: AboutProps = {
  heading: 'About',
  bio: 'I’ve spent the last decade designing products at the intersection of clarity and craft — for startups finding their footing and teams scaling what works. I care about the small moments: the empty state, the loading beat, the word on the button.',
  capabilities: [
    'Product design',
    'Design systems',
    'Art direction',
    'Prototyping',
    'Brand',
    'Workshops',
  ],
};
