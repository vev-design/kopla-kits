import { MediaBlock } from '@/components/blocks';
import type { ImageBlockProps, VideoBlockProps } from '@/components/blocks';
import { Badge } from '@/components/Badge';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * A single large statement built around one piece of media — a screenshot or
 * a clip — held inside a glass frame with a gradient edge and a soft glow
 * behind it, so the product feels lit rather than just displayed. Pair a
 * short label and caption beside it. Use as the one "look at the thing"
 * moment in the chain, after the feature grid.
 */
export interface ShowcaseProps extends SectionBaseProps {
  /** Short label above the caption. 1–3 words, sentence case (e.g. "In motion"). */
  eyebrow?: string | null;
  /** Caption under the label. 1 sentence, 8–20 words. */
  caption: string;
  /** The showcased media — a screenshot or a short clip. */
  media: ImageBlockProps | VideoBlockProps;
}

export function Showcase({ id, eyebrow, caption, media }: ShowcaseProps) {
  return (
    <section id={id ?? undefined} className="relative w-full overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[50rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,var(--chart-1),transparent)] opacity-30 blur-3xl"
      />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 py-24 text-center">
        <Reveal className="flex flex-col items-center gap-4">
          {eyebrow ? <Badge variant="glass">{eyebrow}</Badge> : null}
          <p className="max-w-xl text-lg text-muted-foreground text-pretty md:text-xl">
            {caption}
          </p>
        </Reveal>
        <Reveal className="w-full">
          <div className="rounded-2xl bg-gradient-to-br from-chart-2/50 via-chart-1/40 to-chart-3/50 p-px shadow-[0_0_100px_-24px_var(--chart-2)]">
            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-2xl">
              <MediaBlock media={media} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export const ShowcaseDemo: ShowcaseProps = {
  eyebrow: 'In motion',
  caption:
    'Every panel is real glass — blur, refraction, and the gradient behind it shifting as the page scrolls.',
  media: {
    kind: 'image',
    src: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?auto=format&fit=crop&w=1600&q=80',
    alt: 'A dark interface with layered translucent glass panels glowing over a purple and blue gradient.',
  },
};
