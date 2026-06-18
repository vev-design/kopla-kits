import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Reveal } from '@/motion';
import { cn } from '@/lib/utils';
import { Eyebrow } from '@/components';
import type { SectionBaseProps } from '@/types';

/**
 * Full-bleed image slide with an overlaid heading and caption. A cinematic,
 * wide breath between denser beats. The background image is parallaxed against
 * scroll, with a gradient scrim keeping the overlaid text legible. Use to
 * shift register from data to visual story.
 */
export interface ImageFullProps extends SectionBaseProps {
  /**
   * Full-bleed background image. Landscape orientation reads best.
   * @kind image
   */
  image: string;
  /** Small uppercase label above the heading. 1–2 words, no punctuation. */
  eyebrow?: string | null;
  /** Overlaid heading — the single dominant line. 3–8 words, no trailing period. */
  heading: string;
  /** Optional caption under the heading. 1 sentence, 10–22 words. */
  caption?: string | null;
  /** Where the overlaid text block sits over the image. */
  variant?: 'bottom-left' | 'bottom-center' | 'center';
}

export function ImageFull({
  id,
  image,
  eyebrow,
  heading,
  caption,
  variant = 'bottom-left',
}: ImageFullProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  // Parallax: the image drifts slower than the scroll for depth.
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <section
      id={id ?? undefined}
      ref={ref}
      className="relative flex min-h-screen w-full overflow-hidden bg-background"
    >
      <motion.div
        aria-hidden
        style={{ y, backgroundImage: `url(${image})` }}
        // scale-125 → 12.5% overflow per edge, exceeding the ±8% parallax
        // drift so the background never exposes an edge gap.
        className="absolute inset-0 scale-125 bg-cover bg-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/10"
      />
      <div
        className={cn(
          'relative mx-auto flex w-full max-w-6xl flex-col px-6 py-24 md:px-16',
          variant === 'center' && 'items-center justify-center text-center',
          variant === 'bottom-center' &&
            'items-center justify-end text-center',
          variant === 'bottom-left' && 'items-start justify-end text-left',
        )}
      >
        <div className="max-w-3xl">
          <Reveal>
            {eyebrow ? <Eyebrow className="mb-5">{eyebrow}</Eyebrow> : null}
          </Reveal>
          <Reveal transition={{ delay: 0.06 }}>
            <h2 className="font-display text-4xl font-bold tracking-tight text-balance md:text-7xl">
              {heading}
            </h2>
          </Reveal>
          {caption ? (
            <Reveal transition={{ delay: 0.12 }}>
              <p
                className={cn(
                  'mt-6 max-w-xl text-lg leading-relaxed text-foreground/80 text-pretty md:text-xl',
                  (variant === 'center' || variant === 'bottom-center') &&
                    'mx-auto',
                )}
              >
                {caption}
              </p>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export const ImageFullDemo: ImageFullProps[] = [
  {
    image:
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1920&q=80',
    eyebrow: 'In the field',
    heading: 'Built for the people who never sit at a desk',
    caption:
      'Every crew, every job, every vehicle on one live map — updated the moment something changes on the ground.',
    variant: 'bottom-left',
  },
  {
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80',
    eyebrow: 'The market',
    heading: 'A trillion-dollar category still running on paper',
    variant: 'center',
  },
];
