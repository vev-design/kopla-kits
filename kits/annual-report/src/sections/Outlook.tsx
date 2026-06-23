import { Check } from 'lucide-react';
import { Reveal, Stagger } from '@/motion';
import { Badge } from '@/components/Badge';
import type { SectionBaseProps } from '@/types';

/**
 * The forward-looking beat — the strategy and priorities for the year ahead. A
 * heading and a short statement of intent, paired with a numbered list of
 * strategic priorities. Use after the year-in-review to turn the record into a
 * plan; keep the tone measured and concrete.
 */
export interface OutlookProps extends SectionBaseProps {
  /** Small label above the heading. 1–4 words, no punctuation (e.g. "Looking ahead"). */
  eyebrow?: string | null;
  /** Section heading. 1 sentence, 4–10 words, no trailing period. */
  heading: string;
  /** Forward-looking statement. 2–3 sentences, 40–80 words. */
  body: string;
  /** Strategic priorities for the year ahead. 3–5 items. */
  priorities: {
    /** Priority title. 2–5 words, sentence case (e.g. "Scale recurring revenue"). */
    title: string;
    /** Priority detail. 1 sentence, 12–28 words. */
    detail: string;
  }[];
}

export function Outlook({ id, eyebrow, heading, body, priorities }: OutlookProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-primary text-primary-foreground">
      <div className="mx-auto w-full max-w-6xl px-6 py-24 md:px-12 md:py-32">
        <div className="grid gap-12 md:grid-cols-[1fr_1fr] md:gap-16">
          <Reveal>
            <div className="md:sticky md:top-24">
              {eyebrow ? (
                <Badge
                  variant="rule"
                  className="border-primary-foreground/40 text-primary-foreground"
                >
                  {eyebrow}
                </Badge>
              ) : null}
              <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight tracking-tight text-balance md:text-5xl">
                {heading}
              </h2>
              <p className="mt-6 font-serif text-lg leading-relaxed text-primary-foreground/85 text-pretty md:text-xl">
                {body}
              </p>
            </div>
          </Reveal>

          <Stagger className="flex flex-col" step={0.1}>
            {priorities.map((priority, i) => (
              <div
                key={priority.title}
                className="flex gap-5 border-t border-primary-foreground/20 py-6 first:border-t-0 first:pt-0"
              >
                <span className="mt-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-primary-foreground/40">
                  <Check className="size-4" strokeWidth={2.25} />
                </span>
                <div className="flex flex-col gap-2">
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono text-xs tracking-[0.16em] text-primary-foreground/50">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-serif text-xl font-semibold tracking-tight md:text-2xl">
                      {priority.title}
                    </span>
                  </span>
                  <p className="text-base leading-relaxed text-primary-foreground/75 text-pretty">
                    {priority.detail}
                  </p>
                </div>
              </div>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

export const OutlookDemo: OutlookProps = {
  eyebrow: 'Looking ahead',
  heading: 'Our priorities for the year ahead',
  body: 'We enter the new year with momentum and a clear plan. Our focus is to compound the advantages we built this year — deepening recurring revenue, investing in capacity, and holding the operational discipline that turns growth into durable returns for shareholders.',
  priorities: [
    {
      title: 'Scale recurring revenue',
      detail: 'Expand the software platform across the installed base so a majority of company revenue becomes recurring.',
    },
    {
      title: 'Invest in capacity',
      detail: 'Bring two new facilities online to meet demand without straining the lead times our customers depend on.',
    },
    {
      title: 'Deepen our presence',
      detail: 'Grow share in the European and Asian markets where this year proved our model travels well.',
    },
    {
      title: 'Return capital with discipline',
      detail: 'Sustain the dividend and pursue selective buybacks while preserving the balance sheet for opportunity.',
    },
  ],
};
