import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Single-voice social proof in a dev-tool register: a left-aligned quote set
 * against an iris left-border accent — no oversized quote marks — with the
 * attribution rendered in monospace like a code comment (name — role). Use
 * after the feature grid to convert explanation into belief; one engineer's
 * voice outweighs a wall of capabilities.
 */
export interface TestimonialProps extends SectionBaseProps {
  /** The pull quote. 1–2 sentences, 18–42 words. No surrounding quotation marks. */
  quote: string;
  /** Person's full name. 2–3 words. */
  author: string;
  /** Author's role and company. Short, 3–7 words (e.g. "Staff Engineer, Vector"). */
  role: string;
  /**
   * Optional author avatar (square headshot).
   * @kind image
   */
  avatar?: string | null;
}

export function Testimonial({ id, quote, author, role, avatar }: TestimonialProps) {
  return (
    <section id={id ?? undefined} className="w-full border-y border-border bg-card/40">
      <div className="mx-auto w-full max-w-4xl px-6 py-24">
        <Reveal>
          <figure className="flex flex-col gap-8 border-l-2 border-ring pl-8 md:pl-10">
            <blockquote
              data-slot="body"
              className="text-2xl font-medium leading-snug tracking-tight text-pretty md:text-3xl"
            >
              {quote}
            </blockquote>
            <figcaption className="flex items-center gap-4">
              {avatar ? (
                <img
                  data-slot="media"
                  src={avatar}
                  alt=""
                  className="size-10 rounded-md border border-border object-cover"
                />
              ) : null}
              <p
                data-slot="attribution"
                className="font-mono text-sm text-muted-foreground"
              >
                <span className="text-muted-foreground/60" aria-hidden>
                  {'// '}
                </span>
                <span className="text-foreground">{author}</span>
                {' — '}
                {role}
              </p>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

export const TestimonialDemo: TestimonialProps = {
  quote:
    'We migrated our entire inference stack to Forge in an afternoon by swapping one base URL. Latency dropped 40 percent and we finally have evals our whole team trusts.',
  author: 'Priya Nair',
  role: 'Staff Engineer, Vector',
  avatar:
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
};
