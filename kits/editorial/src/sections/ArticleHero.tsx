import { Reveal } from '@/motion';
import { cn } from '@/lib/utils';
import { Figure } from '@/components';
import type { SectionBaseProps } from '@/types';

/**
 * The reader's entry into the piece: an optional newspaper kicker/dateline
 * block ruled above and below in hairlines, then a large serif lead
 * paragraph opened by an oversized drop cap, followed by an optional
 * full-bleed lead image with its cutline. Place directly after the
 * Masthead — it is the first true beat of the article, the threshold
 * between the cover and the body.
 */
export interface ArticleHeroProps extends SectionBaseProps {
  /** Letterspaced crimson kicker in the ruled dateline block. 1–3 words, Title Case (e.g. "Features"). Omit to hide the block's left slot. */
  kicker?: string | null;
  /** Byline shown opposite the kicker. 2–4 words (e.g. "By Maren Lindqvist"). */
  byline?: string | null;
  /** Dateline shown after the byline, already formatted. Max 24 characters (e.g. "June 2, 2026"). */
  date?: string | null;
  /** Lead paragraph that opens the article. 2–4 sentences, 45–90 words. */
  lead: string;
  /** Whether to open the lead with an oversized serif drop cap, two to three lines tall. */
  dropCap?: boolean;
  /**
   * Optional full-bleed lead image URL. Omit for a pure-text opening.
   * @kind image
   */
  image?: string | null;
  /** Caption under the lead image. 1 sentence, 6–18 words, no trailing period. */
  caption?: string | null;
}

export function ArticleHero({
  id,
  kicker,
  byline,
  date,
  lead,
  dropCap = true,
  image,
  caption,
}: ArticleHeroProps) {
  const hasDateline = Boolean(kicker || byline || date);
  return (
    <section id={id ?? undefined} className="w-full bg-background pb-16 md:pb-24">
      <Reveal className="mx-auto w-full max-w-3xl px-6">
        {hasDateline ? (
          <div className="mb-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5 border-y border-border py-3">
            {kicker ? (
              <p className="font-sans text-xs font-semibold tracking-[0.28em] text-primary uppercase">
                {kicker}
              </p>
            ) : null}
            {byline || date ? (
              <p className="flex flex-wrap items-baseline gap-x-3 font-sans text-xs tracking-[0.16em] text-muted-foreground uppercase">
                {byline ? <span className="text-foreground">{byline}</span> : null}
                {byline && date ? (
                  <span className="text-border" aria-hidden>
                    &middot;
                  </span>
                ) : null}
                {date ? <span>{date}</span> : null}
              </p>
            ) : null}
          </div>
        ) : null}
        {/* Accessible drop cap: style the real first letter via ::first-letter
            so the lead text stays intact + complete for assistive tech (no
            aria-hidden split, no duplicated/hidden characters). */}
        <p
          className={cn(
            'font-serif text-2xl leading-[1.55] text-foreground text-pretty md:text-[1.75rem]',
            dropCap &&
              'first-letter:float-left first-letter:mt-2.5 first-letter:mr-3.5 first-letter:font-serif first-letter:text-8xl first-letter:leading-[0.72] first-letter:font-bold first-letter:text-primary md:first-letter:mt-3 md:first-letter:text-9xl',
          )}
        >
          {lead}
        </p>
      </Reveal>
      {image ? (
        <Reveal className="mx-auto mt-14 w-full max-w-6xl px-6">
          <Figure ratio="wide" caption={caption}>
            <img
              src={image}
              alt={caption ?? ''}
              className="h-full w-full object-cover"
            />
          </Figure>
        </Reveal>
      ) : null}
    </section>
  );
}

export const ArticleHeroDemo: ArticleHeroProps = {
  kicker: 'Features',
  byline: 'By Maren Lindqvist',
  date: 'June 2, 2026',
  lead: 'For most of the last decade the assumption held that attention was a vanishing resource, that readers had been trained out of patience and into the feed. A handful of newsrooms never quite believed it. They kept publishing pieces that ran long, that took weeks, that trusted a reader to stay.',
  dropCap: true,
  image:
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1600&q=80',
  caption: 'The newsroom floor at dusk, when the long pieces tend to get finished',
};
