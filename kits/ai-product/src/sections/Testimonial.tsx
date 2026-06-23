import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Single-voice social proof: one strong customer quote with an attributed
 * author, role, and optional avatar, set on a lifted near-black band. Use
 * after the feature grid to convert explanation into belief — one engineer's
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
        <Reveal className="flex flex-col items-center gap-10 text-center">
          <blockquote className="text-2xl font-medium leading-snug tracking-tight text-balance md:text-3xl">
            &ldquo;{quote}&rdquo;
          </blockquote>
          <figcaption className="flex flex-col items-center gap-4">
            {avatar ? (
              <img
                src={avatar}
                alt=""
                className="size-14 rounded-full border border-border object-cover"
              />
            ) : null}
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold tracking-tight">{author}</span>
              <span className="text-sm text-muted-foreground">{role}</span>
            </div>
          </figcaption>
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
