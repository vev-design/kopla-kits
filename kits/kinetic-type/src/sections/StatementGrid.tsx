import { Card } from '@/components/Card';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * A manifesto-style numbered grid: each cell pairs a huge black-weight index
 * numeral with a mono micro-label, a title, and a short body. Reads like a
 * numbered list blown up to type-as-image scale rather than a conventional
 * icon feature grid. Use after the marquee to state what the brand actually
 * does.
 */
export interface StatementGridProps extends SectionBaseProps {
  /** Small monospace label above the heading. 1–3 words, sentence case (e.g. "How it works"). */
  eyebrow?: string | null;
  /** Section heading. 1 sentence, 3–8 words, no trailing period. */
  heading: string;
  /** Statement cells, rendered in order with an automatic 01, 02, … index. 3–6 items. */
  items: {
    /** Optional monospace micro-label beside the index (e.g. "Motion"). 1–2 words, max 14 characters. */
    label?: string | null;
    /** Statement title. 2–6 words, sentence case. */
    title: string;
    /** Statement body. 1–2 sentences, 14–30 words. */
    body: string;
  }[];
}

export function StatementGrid({ id, eyebrow, heading, items }: StatementGridProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <Reveal className="mb-16 flex max-w-2xl flex-col gap-4">
          {eyebrow ? (
            <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-4xl leading-none tracking-tight text-balance md:text-5xl">
            {heading}
          </h2>
        </Reveal>
        <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2">
          {items.map((item, index) => (
            <Reveal key={item.title}>
              <Card variant="statement">
                <div className="flex items-start justify-between gap-4">
                  <span
                    className="text-7xl leading-none tracking-tight text-accent md:text-8xl"
                    style={{ fontVariationSettings: "'wght' 900" }}
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {item.label ? (
                    <span className="mt-2 font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">
                      {item.label}
                    </span>
                  ) : null}
                </div>
                <h3 className="text-2xl leading-tight tracking-tight" style={{ fontVariationSettings: "'wght' 700" }}>
                  {item.title}
                </h3>
                <p className="text-base text-muted-foreground text-pretty">{item.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export const StatementGridDemo: StatementGridProps = {
  eyebrow: 'How it works',
  heading: 'Four moves, one system',
  items: [
    {
      label: 'Scrub',
      title: 'Weight follows scroll',
      body: 'Headlines sweep from hairline to black as you move down the page, so motion reads as meaning, not decoration.',
    },
    {
      label: 'Loop',
      title: 'A ticker that never stops',
      body: 'A marquee of value props idles in the background, giving the page a pulse even when nobody scrolls.',
    },
    {
      label: 'Reveal',
      title: 'Copy arrives in beats',
      body: 'Pull-quotes and statements stagger in line by line instead of appearing all at once.',
    },
    {
      label: 'Count',
      title: 'Numbers earn their size',
      body: 'Stats roll up from zero the moment they land in view, turning proof points into a small performance.',
    },
  ],
};
