import type { SectionBaseProps } from '@/types';

const SPEED_DURATIONS: Record<'slow' | 'base' | 'fast', string> = {
  slow: '42s',
  base: '28s',
  fast: '16s',
};

/**
 * An infinite horizontal ticker of bold value-prop phrases, separated by an
 * asterisk glyph. Idles continuously regardless of scroll position — a CSS
 * keyframe loop over a doubled track, unlike the rest of the system's
 * scroll-driven motion. Use as a rhythm break between the hero and the
 * feature grid.
 */
export interface MarqueeProps extends SectionBaseProps {
  /** Phrases in the loop. 3–8 short items, each 1–4 words, no punctuation (e.g. "Made to move"). */
  items: string[];
  /** Loop speed. `base` is the default; `slow`/`fast` lengthen or shorten the loop duration. */
  speed?: 'slow' | 'base' | 'fast';
}

export function Marquee({ id, items, speed = 'base' }: MarqueeProps) {
  // Rendered twice back-to-back so the -50% translateX loop is seamless.
  const track = [...items, ...items];
  return (
    <section
      id={id ?? undefined}
      // overflow-anchor: none opts this section out of the browser's scroll
      // anchoring — a continuously-transforming subtree can otherwise get
      // misread as a layout-shift candidate, which some browsers "correct"
      // for by nudging scroll position while it's in view (felt as a jump
      // while scrolling past it).
      className="w-full overflow-hidden border-y border-border bg-foreground py-6 [overflow-anchor:none]"
    >
      <div
        className="flex w-max shrink-0 animate-marquee-scroll gap-10 whitespace-nowrap will-change-transform"
        style={{ ['--marquee-duration' as string]: SPEED_DURATIONS[speed] }}
      >
        {track.map((item, index) => (
          <span
            key={index}
            className="flex items-center gap-10 text-4xl leading-none tracking-tight text-background md:text-5xl"
            style={{ fontVariationSettings: "'wght' 700" }}
          >
            {item}
            <span aria-hidden className="text-accent">
              *
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}

export const MarqueeDemo: MarqueeProps = {
  items: ['Made to move', 'Type over image', 'Weight is the message', 'Scroll to feel it', 'No stock photos'],
  speed: 'base',
};
