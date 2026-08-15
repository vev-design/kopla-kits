import { GlassCard } from '@/components/GlassCard';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Single-voice social proof rendered as a floating glass-paneled quote card
 * over the vivid canvas — one strong customer quote with an attributed
 * author, role, and optional avatar. Use after the feature grid to convert
 * explanation into belief.
 */
export interface TestimonialProps extends SectionBaseProps {
  /** The pull quote. 1–2 sentences, 18–42 words. No surrounding quotation marks. */
  quote: string;
  /** Person's full name. 2–3 words. */
  author: string;
  /** Author's role and company. Short, 3–7 words (e.g. "Head of Design, Cedar"). */
  role: string;
  /**
   * Optional author avatar (square headshot).
   * @kind image
   */
  avatar?: string | null;
}

export function Testimonial({ id, quote, author, role, avatar }: TestimonialProps) {
  return (
    <section id={id ?? undefined} className="w-full">
      <div className="mx-auto w-full max-w-4xl px-6 py-24">
        <Reveal>
          <GlassCard
            variant="frosted"
            className="items-center gap-10 px-8 py-16 text-center md:px-16"
          >
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
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}

export const TestimonialDemo: TestimonialProps = {
  quote:
    'We swapped our flat card UI for Halo in an afternoon. The glass panels make the whole product feel like it has depth for the first time — customers keep asking what changed.',
  author: 'Priya Nakamura',
  role: 'Head of Design, Cedar',
  avatar:
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
};
