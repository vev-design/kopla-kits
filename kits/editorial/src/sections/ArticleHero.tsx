import { Reveal } from '@/motion';
import { cn } from '@/lib/utils';
import { Figure } from '@/components';
import type { SectionBaseProps } from '@/types';

/**
 * The reader's entry into the piece: a large lead paragraph set in the
 * body face, with an optional drop initial, followed by an optional
 * full-bleed lead image and its caption. Place directly after the
 * Masthead — it is the first true beat of the article, the visual and
 * editorial threshold between the cover and the body.
 */
export interface ArticleHeroProps extends SectionBaseProps {
  /** Lead paragraph that opens the article. 2–4 sentences, 45–90 words. */
  lead: string;
  /** Whether to render an oversized crimson drop initial on the lead's first letter. */
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
  lead,
  dropCap = true,
  image,
  caption,
}: ArticleHeroProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background pb-16 md:pb-24">
      <Reveal className="mx-auto w-full max-w-3xl px-6">
        {/* Accessible drop cap: style the real first letter via ::first-letter
            so the lead text stays intact + complete for assistive tech (no
            aria-hidden split, no duplicated/hidden characters). */}
        <p
          className={cn(
            'font-serif text-2xl leading-[1.55] text-foreground text-pretty md:text-[1.75rem]',
            dropCap &&
              'first-letter:float-left first-letter:mt-2 first-letter:mr-3 first-letter:font-serif first-letter:text-7xl first-letter:leading-[0.72] first-letter:font-bold first-letter:text-primary md:first-letter:text-8xl',
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
  lead: 'For most of the last decade the assumption held that attention was a vanishing resource, that readers had been trained out of patience and into the feed. A handful of newsrooms never quite believed it. They kept publishing pieces that ran long, that took weeks, that trusted a reader to stay.',
  dropCap: true,
  image:
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1600&q=80',
  caption: 'The newsroom floor at dusk, when the long pieces tend to get finished',
};
