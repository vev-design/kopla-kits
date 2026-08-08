import { Stagger } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * A large pull-quote, pre-split into short phrases that reveal one at a time
 * on scroll — a mask-reveal read as staggered lines rather than a single
 * block of text. Attribution sits below in monospace. Use after the stat
 * showcase to convert proof into belief with a single voice.
 */
export interface TestimonialProps extends SectionBaseProps {
  /** The quote, pre-split into short phrases — each renders as its own staggered line. 3–5 phrases, each 3–8 words, no surrounding quotation marks. */
  lines: string[];
  /** Person's full name. 2–3 words. */
  author: string;
  /** Author's role and company. Short, 3–7 words (e.g. "Creative Director, Loop Studio"). */
  role: string;
  /**
   * Optional author avatar (square headshot).
   * @kind image
   */
  avatar?: string | null;
}

export function Testimonial({ id, lines, author, role, avatar }: TestimonialProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background">
      <div className="mx-auto w-full max-w-4xl px-6 py-24">
        <Stagger step={0.12} className="flex flex-col gap-1">
          {lines.map((line, index) => (
            <p
              key={index}
              className="text-3xl leading-tight tracking-tight text-balance md:text-4xl"
              style={{ fontVariationSettings: "'wght' 600" }}
            >
              {line}
            </p>
          ))}
        </Stagger>
        <div className="mt-10 flex items-center gap-4">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className="size-10 rounded-full border border-border object-cover"
            />
          ) : null}
          <p className="font-mono text-sm text-muted-foreground">
            <span className="text-foreground">{author}</span>
            {' — '}
            {role}
          </p>
        </div>
      </div>
    </section>
  );
}

export const TestimonialDemo: TestimonialProps = {
  lines: [
    'We stopped shooting campaigns.',
    'We started scoring them instead.',
    'Every headline now moves like the drop it sells.',
  ],
  author: 'Mika Torres',
  role: 'Creative Director, Loop Studio',
  avatar:
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80',
};
