import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Opening cover for a longform piece: a small publication kicker, an
 * oversized serif title, and a byline/date dateline. This is the first
 * section on the page — it sets voice and establishes the masthead before
 * any body copy. Type-led, generous margins, crimson used only on the rule
 * above the kicker.
 */
export interface MastheadProps extends SectionBaseProps {
  /** Publication or section kicker above the title. 1–4 words, Title Case (e.g. "The Atlantic", "Features"). */
  publication: string;
  /** The headline of the piece. 1 line, 3–9 words, no trailing period. */
  title: string;
  /** Optional standfirst under the title. 1 sentence, 10–24 words. */
  subtitle?: string | null;
  /** Author name for the byline. 2–3 words (e.g. "Maren Lindqvist"). */
  author?: string | null;
  /** Publication date, already formatted. Max 24 characters (e.g. "June 2, 2026"). */
  date?: string | null;
  /** Optional read-time or section label on the dateline. Max 16 characters (e.g. "12 min read"). */
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
  const dateline = [author, date, meta].filter(Boolean);
  return (
    <section
      id={id ?? undefined}
      className="w-full bg-background px-6 pt-24 pb-16 md:pt-36 md:pb-24"
    >
      <Reveal className="mx-auto w-full max-w-3xl">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-primary" aria-hidden />
          <p className="font-sans text-xs font-semibold tracking-[0.28em] text-primary uppercase">
            {publication}
          </p>
        </div>
        <h1 className="mt-8 font-serif text-5xl leading-[1.04] font-bold tracking-[-0.02em] text-balance text-foreground md:text-7xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-7 max-w-2xl font-serif text-xl leading-relaxed text-muted-foreground italic md:text-2xl">
            {subtitle}
          </p>
        ) : null}
        {dateline.length > 0 ? (
          <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-5 font-sans text-sm text-muted-foreground">
            {author ? (
              <span className="font-medium text-foreground">By {author}</span>
            ) : null}
            {date ? (
              <>
                {author ? <span className="text-border">/</span> : null}
                <span>{date}</span>
              </>
            ) : null}
            {meta ? (
              <>
                {author || date ? <span className="text-border">/</span> : null}
                <span className="tracking-wide uppercase">{meta}</span>
              </>
            ) : null}
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
