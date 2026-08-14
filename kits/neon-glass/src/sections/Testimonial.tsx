import { Card } from '@/components/Card';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * A single voice of social proof in a glass panel, quote mark rendered as a
 * soft pink glyph rather than oversized punctuation. Use after the stat row
 * to turn momentum into belief.
 */
export interface TestimonialProps extends SectionBaseProps {
  /** The pull quote. 1–2 sentences, 18–42 words. No surrounding quotation marks. */
  quote: string;
  /** Person's full name. 2–3 words. */
  author: string;
  /** Author's role and company. Short, 3–7 words (e.g. "Creative Director, Halo Studio"). */
  role: string;
  /**
   * Optional author avatar (square headshot).
   * @kind image
   */
  avatar?: string | null;
}

export function Testimonial({ id, quote, author, role, avatar }: TestimonialProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background">
      <div className="mx-auto w-full max-w-3xl px-6 py-24">
        <Reveal>
          <Card variant="glass" className="items-center gap-8 p-10 text-center md:p-14">
            <span className="font-[family-name:var(--font-display)] text-6xl leading-none text-primary" aria-hidden>
              &ldquo;
            </span>
            <blockquote className="text-2xl leading-snug tracking-tight text-pretty md:text-3xl">
              {quote}
            </blockquote>
            <figcaption className="flex items-center gap-4">
              {avatar ? (
                <img
                  src={avatar}
                  alt=""
                  className="size-11 rounded-full border border-border object-cover"
                />
              ) : null}
              <p className="text-left text-sm text-muted-foreground">
                <span className="block font-medium text-foreground">{author}</span>
                {role}
              </p>
            </figcaption>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

export const TestimonialDemo: TestimonialProps = {
  quote:
    'Every screen we shipped in this system looked like a still from a music video. Users kept scrolling just to see what the light would do next.',
  author: 'Marisol Ng',
  role: 'Creative Director, Halo Studio',
  avatar:
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
};
