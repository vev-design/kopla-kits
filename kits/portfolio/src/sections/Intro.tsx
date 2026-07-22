import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Type-only opener — the name sits small at the top, an oversized serif
 * statement fills the viewport, an italic accent phrase answers it in
 * terracotta, and a quiet meta row closes the frame. No imagery: the
 * typography is the visual. Use as the first section, above the fold.
 */
export interface IntroProps extends SectionBaseProps {
  /** Name or studio, set small above the statement. 1–3 words. */
  name: string;
  /** The oversized display statement — a practice line or positioning claim. 3–8 words, no trailing period. */
  statement: string;
  /** Italic accent phrase under the statement. 2–7 words, lowercase reads best (e.g. "product design & art direction"). */
  accent?: string | null;
  /** Meta row items — location, availability, roles. 0–4 items, 1–4 words each. */
  meta?: string[] | null;
}

export function Intro({ id, name, statement, accent, meta }: IntroProps) {
  return (
    <section
      id={id ?? undefined}
      className="mx-auto flex min-h-[88vh] w-full max-w-6xl flex-col px-6 pt-10 pb-10 md:pt-12 md:pb-14"
    >
      <Reveal>
        <p
          data-slot="eyebrow"
          className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground"
        >
          {name}
        </p>
      </Reveal>
      <Reveal className="my-auto flex flex-col gap-6 py-16 md:gap-8 md:py-20">
        <h1
          data-slot="heading"
          className="font-display text-6xl font-medium leading-[0.98] tracking-tight text-balance sm:text-7xl md:text-8xl lg:text-9xl"
        >
          {statement}
        </h1>
        {accent ? (
          <p
            data-slot="subhead"
            className="font-serif text-2xl italic leading-snug text-primary md:text-4xl"
          >
            {accent}
          </p>
        ) : null}
      </Reveal>
      {meta && meta.length > 0 ? (
        <Reveal>
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-5 text-sm text-muted-foreground">
            {meta.map((item, i) => (
              <li key={i} data-slot="item" className="flex items-center gap-3">
                {i > 0 ? (
                  <span aria-hidden className="text-border">
                    /
                  </span>
                ) : null}
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}
    </section>
  );
}

export const IntroDemo: IntroProps = {
  name: 'Maya Okafor',
  statement: 'Design that earns its place',
  accent: 'product design & art direction',
  meta: ['Lisbon, Portugal', 'Available spring 2027', 'Independent since 2019'],
};
