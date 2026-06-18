import { Badge } from '@/components';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Opening statement of a portfolio — who you are and what you do, in big
 * confident type. Use as the first section, above the fold.
 */
export interface IntroProps extends SectionBaseProps {
  /** Name or studio. 1–3 words. */
  name: string;
  /** Role / discipline. 2–5 words, e.g. "Product designer & art director". */
  role: string;
  /** Short positioning statement. 1–2 sentences, 12–30 words. */
  statement: string;
  /** Optional availability note. 3–6 words, e.g. "Available for select projects". */
  availability?: string | null;
}

export function Intro({ id, name, role, statement, availability }: IntroProps) {
  return (
    <section
      id={id ?? undefined}
      className="mx-auto w-full max-w-5xl px-6 pt-28 pb-16 md:pt-40 md:pb-24"
    >
      <Reveal className="flex flex-col gap-6">
        {availability ? (
          <Badge size="xs" dot>
            {availability}
          </Badge>
        ) : null}
        <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-balance md:text-7xl">
          {name}
        </h1>
        <p className="text-xl text-muted-foreground md:text-2xl">{role}</p>
        <p className="max-w-2xl text-lg leading-relaxed text-foreground/80 text-pretty">
          {statement}
        </p>
      </Reveal>
    </section>
  );
}

export const IntroDemo: IntroProps = {
  name: 'Maya Okafor',
  role: 'Product designer & art director',
  statement:
    'I help teams turn fuzzy ideas into calm, considered interfaces — from the first sketch to the shipped product.',
  availability: 'Available for select projects',
};
