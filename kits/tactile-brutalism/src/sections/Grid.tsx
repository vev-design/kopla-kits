import { Card } from '@/components/Card';
import { Reveal } from '@/motion';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * Bento capability grid built from bordered cells instead of icons: the
 * FIRST item anchors a large 2×2 cell, the next three fill single cells
 * beside it, and any further items render as wide half-row cells below.
 * Each cell carries a mono index number rather than an illustration —
 * typography does the work. Use after the marquee to explain the offer.
 */
export interface GridProps extends SectionBaseProps {
  /** Small mono label above the heading. 1–3 words, sentence case (e.g. "Capabilities"). */
  eyebrow?: string | null;
  /** Section heading. 1 sentence, 3–8 words, no trailing period, reads well in all caps. */
  heading: string;
  /** Supporting line under the heading. 1 sentence, 12–24 words. */
  subhead?: string | null;
  /** Grid cells. 4 or 6 items fill the bento exactly; the FIRST item is the large anchor cell. */
  items: {
    /** Cell title. 1–4 words, sentence case. */
    title: string;
    /** Cell body. 1–2 sentences, 12–28 words. */
    body: string;
  }[];
}

export function Grid({ id, eyebrow, heading, subhead, items }: GridProps) {
  return (
    <section id={id ?? undefined} className="w-full border-b border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <Reveal className="mb-12 flex max-w-2xl flex-col items-start gap-4">
          {eyebrow ? (
            <p className="font-mono text-xs tracking-[0.18em] text-primary uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-4xl font-black tracking-tight text-balance uppercase md:text-5xl">
            {heading}
          </h2>
          {subhead ? (
            <p className="text-lg text-muted-foreground text-pretty">{subhead}</p>
          ) : null}
        </Reveal>
        {/* Span classes sit on the grid's direct children — Reveal wraps each
            one in its own div, so the span utilities stay on that wrapper. */}
        <div className="grid border-t border-l border-border sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => {
            const isAnchor = index === 0;
            const isWide = index >= 4;
            return (
              <Reveal
                key={item.title}
                className={cn(
                  isAnchor && 'sm:col-span-2 sm:row-span-2',
                  isWide && 'lg:col-span-2',
                )}
              >
                <Card
                  variant="panel"
                  className={cn(
                    'h-full justify-between border-t-0 border-l-0',
                    isAnchor && 'lg:p-10',
                  )}
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3
                      className={cn(
                        'font-black tracking-tight uppercase',
                        isAnchor ? 'text-3xl' : 'text-xl',
                      )}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={cn(
                        'text-muted-foreground text-pretty',
                        isAnchor ? 'text-base' : 'text-sm',
                      )}
                    >
                      {item.body}
                    </p>
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const GridDemo: GridProps = {
  eyebrow: 'Capabilities',
  heading: 'One shop, start to finish',
  subhead:
    'Every stage stays in-house — no handoffs, no lost tolerances between a sketch and the part in your hand.',
  items: [
    {
      title: 'Rapid prototyping',
      body: 'Cut and print working parts in a day so a design decision costs an afternoon, not a fiscal quarter.',
    },
    {
      title: 'CNC tooling',
      body: 'Five-axis machining for jigs, fixtures, and short-run production tooling held to hundredths of a millimeter.',
    },
    {
      title: 'Cast components',
      body: 'Aluminum and resin casting for enclosures and brackets that need mass and finish, not just geometry.',
    },
    {
      title: 'Field testing',
      body: 'We run every unit through a drop, dust, and thermal cycle before it ships to a client site.',
    },
  ],
};
