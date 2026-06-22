import { Reveal } from '@/motion';
import { cn } from '@/lib/utils';
import { MediaBlock } from '@/components/blocks';
import type { ChartBlockProps, ImageBlockProps, VideoBlockProps } from '@/components/blocks';
import { Eyebrow, Figure } from '@/components';
import type { SectionBaseProps } from '@/types';

/**
 * A body beat that pairs one media block with a block of prose. Use these
 * down the article and flip the `variant` between rows so the media
 * alternates sides and the read never feels mechanical. The text column
 * holds a small kicker, a serif subhead, and a paragraph or two; the
 * media column holds a single supporting photograph — or a small chart
 * when the story turns on numbers — with an optional caption.
 */
export interface ImageTextProps extends SectionBaseProps {
  /** Small kicker above the subhead. 1–3 words, Title Case. */
  kicker?: string | null;
  /** Section subhead. 1 line, 3–8 words, no trailing period. */
  heading: string;
  /** Body copy for this beat. 2–4 sentences, 50–110 words. */
  body: string;
  /**
   * What fills the media column: a photograph (`kind: 'image'`), a video
   * clip (`kind: 'video'`), or a small data chart (`kind: 'chart'`) when
   * the beat makes a numeric point. Prefer photographs; reach for a chart
   * only when the body copy cites figures the reader should see.
   */
  media: ImageBlockProps | VideoBlockProps | ChartBlockProps;
  /** Caption under the media. 1 sentence, 5–16 words, no trailing period. */
  caption?: string | null;
  /** Which side the media sits on. `image-left` puts it first; `image-right` puts the text first. */
  variant?: 'image-left' | 'image-right';
}

export function ImageText({
  id,
  kicker,
  heading,
  body,
  media,
  caption,
  variant = 'image-left',
}: ImageTextProps) {
  const imageFirst = variant === 'image-left';
  return (
    <section id={id ?? undefined} className="w-full bg-background py-14 md:py-20">
      <Reveal className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-2 md:gap-16">
        <Figure
          ratio="tall"
          caption={caption}
          className={imageFirst ? 'md:order-1' : 'md:order-2'}
        >
          <MediaBlock media={media} />
        </Figure>
        <div className={cn(imageFirst ? 'md:order-2' : 'md:order-1')}>
          {kicker ? <Eyebrow>{kicker}</Eyebrow> : null}
          <h2 className="mt-4 font-serif text-3xl leading-tight font-bold tracking-[-0.01em] text-balance text-foreground md:text-4xl">
            {heading}
          </h2>
          <p className="mt-5 font-sans text-lg leading-relaxed text-muted-foreground text-pretty">
            {body}
          </p>
        </div>
      </Reveal>
    </section>
  );
}

export const ImageTextDemo: ImageTextProps[] = [
  {
    kicker: 'The Method',
    heading: 'Weeks, not minutes',
    body: 'Editors describe a workflow that looks almost antique: a story is assigned, then reported for as long as it takes, then read aloud in a room before it ships. Nothing is published to hit a number. The result is fewer pieces, but each one is meant to be the only thing you read that morning.',
    media: {
      kind: 'image',
      src: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
      alt: 'A typewriter on a wooden desk beside a marked-up manuscript',
    },
    caption: 'A draft marked up the old way, in pencil',
    variant: 'image-left',
  },
  {
    kicker: 'The Reader',
    heading: 'An audience that stayed',
    body: 'The bet was that a smaller, paying readership would outlast a larger borrowed one. So far the numbers are quiet but durable: renewal rates that look more like a magazine than a feed, and a comment culture that reads like correspondence. The readers, it turns out, were never the problem.',
    media: {
      kind: 'chart',
      type: 'bar',
      data: [
        { label: '2022', value: 71 },
        { label: '2023', value: 78 },
        { label: '2024', value: 84 },
        { label: '2025', value: 89 },
      ],
    },
    caption: 'Subscriber renewal rate by year, percent',
    variant: 'image-right',
  },
  {
    kicker: 'The Room',
    heading: 'Read aloud before it ships',
    body: 'Every feature is read to the room before it runs — a habit borrowed from radio more than print. Sentences that stumble out loud get cut, and the piece that reaches you has already survived an audience of its hardest readers. The recording below is one such session, lightly edited.',
    media: {
      kind: 'video',
      src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
      poster:
        'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=80',
      title: 'An editor reading a draft aloud to the newsroom',
    },
    caption: 'A read-aloud session in the main room',
    variant: 'image-left',
  },
];
