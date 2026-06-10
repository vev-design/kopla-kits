import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Full-screen opening slide for a pitch deck or keynote: an oversized title,
 * a one-line premise, and a presenter / date line. Use as the very first
 * section to set the bold, dark tone before any content lands. Cold open —
 * one idea, maximum scale.
 */
export interface TitleSlideProps extends SectionBaseProps {
  /** Small uppercase tag above the title (e.g. company or deck label). 1–3 words, no punctuation. */
  kicker?: string | null;
  /** The deck title — the single dominant element. 2–6 words, no trailing period. */
  title: string;
  /** One-line premise under the title. 1 sentence, 8–18 words. */
  subtitle?: string | null;
  /** Presenter name, optionally with a role (e.g. "Ada Lovelace, CEO"). 2–6 words. */
  presenter?: string | null;
  /** Date or occasion line (e.g. "Series A · March 2026"). Max 30 characters. */
  date?: string | null;
}

export function TitleSlide({
  id,
  kicker,
  title,
  subtitle,
  presenter,
  date,
}: TitleSlideProps) {
  return (
    <section
      id={id ?? undefined}
      className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden bg-background px-6 py-24 md:px-16"
    >
      {/* Decorative accent wash anchored bottom-left. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-primary/15 blur-3xl"
      />
      <div className="relative mx-auto w-full max-w-6xl">
        <Reveal>
          {kicker ? (
            <p className="mb-8 inline-flex items-center gap-3 text-xs font-semibold tracking-[0.28em] text-primary uppercase">
              <span className="h-px w-10 bg-primary" />
              {kicker}
            </p>
          ) : null}
        </Reveal>
        <Reveal transition={{ delay: 0.05 }}>
          <h1 className="font-display text-6xl leading-[0.95] font-bold tracking-tight text-balance md:text-8xl lg:text-9xl">
            {title}
          </h1>
        </Reveal>
        {subtitle ? (
          <Reveal transition={{ delay: 0.12 }}>
            <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted-foreground text-pretty md:text-2xl">
              {subtitle}
            </p>
          </Reveal>
        ) : null}
        {presenter || date ? (
          <Reveal transition={{ delay: 0.2 }}>
            <div className="mt-16 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium tracking-wide text-foreground/80 md:text-base">
              {presenter ? <span>{presenter}</span> : null}
              {presenter && date ? (
                <span className="text-primary">·</span>
              ) : null}
              {date ? (
                <span className="text-muted-foreground">{date}</span>
              ) : null}
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

export const TitleSlideDemo: TitleSlideProps = {
  kicker: 'Northwind',
  title: 'The operating system for field teams',
  subtitle:
    'We turn scattered spreadsheets and radio chatter into one live picture of every job in the field.',
  presenter: 'Ada Lovelace, CEO',
  date: 'Series A · March 2026',
};
