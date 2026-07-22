import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Opening cover set like a broadsheet front page: a dateline strip between
 * hairline rules, the publication wordmark centered in the serif face with
 * a double hairline rule beneath, then the headline, standfirst, and a
 * centered byline. This is the first section on the page — it establishes
 * the masthead before any body copy. Type-led and centered; crimson appears
 * only on the small rules flanking the byline.
 */
export interface MastheadProps extends SectionBaseProps {
  /** Publication name set as the centered wordmark. 1–4 words, Title Case (e.g. "The Long Field"). */
  publication: string;
  /** The headline of the piece. 1 line, 3–9 words, no trailing period. */
  title: string;
  /** Optional standfirst under the title. 1 sentence, 10–24 words. */
  subtitle?: string | null;
  /** Author name for the byline. 2–3 words (e.g. "Maren Lindqvist"). */
  author?: string | null;
  /** Publication date shown in the top dateline strip, already formatted. Max 24 characters (e.g. "June 2, 2026"). */
  date?: string | null;
  /** Optional read-time or edition label in the dateline strip. Max 16 characters (e.g. "12 min read"). */
  meta?: string | null;
}

export function Masthead({
  id,
  publication,
  title,
  subtitle,
  author,
  date,
  meta,
}: MastheadProps) {
  const hasDateline = Boolean(date || meta);
  return (
    <section
      id={id ?? undefined}
      className="w-full bg-background px-6 pt-14 pb-16 md:pt-20 md:pb-24"
    >
      <Reveal className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        {hasDateline ? (
          <div className="w-full border-y border-border py-2.5">
            <p data-slot="dateline" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-sans text-[0.7rem] tracking-[0.24em] text-muted-foreground uppercase">
              {date ? <span>{date}</span> : null}
              {date && meta ? (
                <span className="text-border" aria-hidden>
                  &middot;
                </span>
              ) : null}
              {meta ? <span>{meta}</span> : null}
            </p>
          </div>
        ) : null}
        {/* Wordmark: the publication set like a newspaper nameplate. */}
        <p data-slot="wordmark" className="mt-10 font-serif text-4xl leading-none font-bold tracking-[-0.01em] text-foreground md:text-5xl">
          {publication}
        </p>
        {/* Double hairline rule beneath the nameplate — the masthead's signature. */}
        <div className="mt-6 w-full" aria-hidden>
          <div className="border-t border-foreground" />
          <div className="mt-[3px] border-t border-foreground" />
        </div>
        <h1 data-slot="heading" className="mt-12 font-serif text-5xl leading-[1.04] font-bold tracking-[-0.02em] text-balance text-foreground md:text-7xl">
          {title}
        </h1>
        {subtitle ? (
          <p data-slot="subhead" className="mt-7 max-w-2xl font-serif text-xl leading-relaxed text-muted-foreground italic md:text-2xl">
            {subtitle}
          </p>
        ) : null}
        {author ? (
          <div className="mt-10 flex items-center gap-4">
            <span className="h-px w-8 bg-primary" aria-hidden />
            <p data-slot="byline" className="font-sans text-xs font-medium tracking-[0.22em] text-foreground uppercase">
              By {author}
            </p>
            <span className="h-px w-8 bg-primary" aria-hidden />
          </div>
        ) : null}
      </Reveal>
    </section>
  );
}

export const MastheadDemo: MastheadProps = {
  publication: 'The Long Field',
  title: 'The Quiet Return of the Slow Newsroom',
  subtitle:
    'Inside a generation of editors betting that readers still want one long story done well over a feed of fragments.',
  author: 'Maren Lindqvist',
  date: 'June 2, 2026',
  meta: '14 min read',
};
