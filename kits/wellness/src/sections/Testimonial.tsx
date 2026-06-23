import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * A warm member quote — a single human voice that conveys how the studio
 * feels. One soft pull quote with an attributed name, role, and optional
 * avatar, centered on a gentle tinted band. Use after membership to reassure
 * before the closing call to action.
 */
export interface TestimonialProps extends SectionBaseProps {
  /** The pull quote. 1–2 sentences, 18–44 words. No surrounding quotation marks. */
  quote: string;
  /** Member's full name. 2–3 words. */
  author: string;
  /** Member's descriptor. Short, 2–5 words (e.g. "Member since 2022"). */
  role: string;
  /**
   * Optional member avatar (square headshot).
   * @kind image
   */
  avatar?: string | null;
}

export function Testimonial({ id, quote, author, role, avatar }: TestimonialProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-secondary/50">
      <div className="mx-auto w-full max-w-3xl px-6 py-24">
        <Reveal className="flex flex-col items-center gap-10 text-center">
          <blockquote className="font-serif text-2xl font-medium leading-relaxed tracking-tight text-balance md:text-3xl">
            &ldquo;{quote}&rdquo;
          </blockquote>
          <figcaption className="flex flex-col items-center gap-4">
            {avatar ? (
              <img
                src={avatar}
                alt=""
                className="size-16 rounded-full border border-border object-cover"
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
    'I came in stiff and stressed and left feeling like myself again. The teachers never push, the room smells of eucalyptus, and for one hour the whole noisy world finally goes quiet.',
  author: 'Priya Anand',
  role: 'Member since 2022',
  avatar:
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
};
