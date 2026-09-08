import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * A single hairline-ruled row of raw mono words scrolling past — closer to a
 * printout ticker than a marketing logo strip. Sits directly under the hero
 * to establish the mono voice before any body copy. Static (no JS): the
 * animation is a pure CSS keyframe loop.
 */
export interface MarqueeProps extends SectionBaseProps {
  /** Small mono lead-in above the ticker. 2–4 words, sentence case (e.g. "What we build"). */
  eyebrow?: string | null;
  /** Words/phrases that scroll past. 5–10 items. Each: 1–3 words, no punctuation. */
  items: string[];
}

export function Marquee({ id, eyebrow, items }: MarqueeProps) {
  const loop = [...items, ...items];
  return (
    <section id={id ?? undefined} className="w-full border-b border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 pt-10">
        {eyebrow ? (
          <Reveal>
            <p className="mb-6 font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
              {eyebrow}
            </p>
          </Reveal>
        ) : null}
      </div>
      <div className="relative overflow-hidden border-t border-border py-6">
        <div className="animate-[brutalist-marquee_28s_linear_infinite] flex w-max items-center gap-10 will-change-transform">
          {loop.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="flex items-center gap-10 font-display text-3xl font-black tracking-tight whitespace-nowrap uppercase md:text-5xl"
            >
              {item}
              <span aria-hidden className="text-primary">
                /
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export const MarqueeDemo: MarqueeProps = {
  eyebrow: 'What we build',
  items: ['Prototyping', 'CNC Tooling', 'Enclosures', 'Cast Parts', 'Assembly', 'Field Test'],
};
