import { Reveal } from '@/motion';
import { SlideChrome, type SlideProgress } from '@/components/SlideChrome';
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
  /** This slide's position in the deck, rendered as slide chrome — a mono "01 / 06" counter plus progress dots in the top-right corner. Use the same `total` on every slide; omit to hide. */
  progress?: SlideProgress | null;
  /** Running footer label pinned bottom-left — deck title or occasion (e.g. "Northwind — Series A"). 2–5 words, max 40 characters; omit to hide. */
  footer?: string | null;
}

export function TitleSlide({
  id,
  kicker,
  title,
  subtitle,
  presenter,
  date,
  progress,
  footer,
}: TitleSlideProps) {
  return (
    <section
      id={id ?? undefined}
      className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden bg-background px-6 py-24 md:px-16"
    >
      <SlideChrome progress={progress} footer={footer} />
      {/* Decorative accent wash anchored bottom-left. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-primary/15 blur-3xl"
      />
      <div className="relative mx-auto w-full max-w-6xl">
        <Reveal>
          {kicker ? (
            <p
              data-slot="eyebrow"
              className="mb-8 inline-flex items-center gap-3 text-xs font-semibold tracking-[0.28em] text-primary uppercase"
            >
              <span className="h-px w-10 bg-primary" />
              {kicker}
            </p>
          ) : null}
        </Reveal>
        <Reveal transition={{ delay: 0.05 }}>
          <h1
            data-slot="heading"
            className="font-display text-6xl leading-[0.9] font-bold tracking-tighter text-balance md:text-8xl lg:text-9xl"
          >
            {title}
          </h1>
        </Reveal>
        {subtitle ? (
          <Reveal transition={{ delay: 0.12 }}>
            <p
              data-slot="subhead"
              className="mt-8 max-w-2xl text-xl leading-relaxed text-muted-foreground text-pretty md:text-2xl"
            >
              {subtitle}
            </p>
          </Reveal>
        ) : null}
        {presenter || date ? (
          <Reveal transition={{ delay: 0.2 }}>
            <div className="mt-16 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium tracking-wide text-foreground/80 md:text-base">
              {presenter ? (
                <span data-slot="presenter">{presenter}</span>
              ) : null}
              {presenter && date ? (
                <span className="text-primary">·</span>
              ) : null}
              {date ? (
                <span data-slot="date" className="text-muted-foreground">
                  {date}
                </span>
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
  progress: { current: 1, total: 6 },
  footer: 'Northwind — Series A',
};
