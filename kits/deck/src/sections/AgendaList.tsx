import { Reveal, Stagger } from '@/motion';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * Full-screen agenda slide: a heading plus a numbered list of the beats the
 * deck will cover, with oversized numerals. Use early — right after the title
 * — to frame the journey so the viewer knows the shape of what's coming.
 */
export interface AgendaListProps extends SectionBaseProps {
  /** Small uppercase label above the heading. 1–2 words, no punctuation. */
  eyebrow?: string | null;
  /** Section heading. 1–4 words, no trailing period. */
  heading: string;
  /** Agenda items, rendered with big numerals. 3–6 items. */
  items: {
    /** Item title. 1–4 words, title case, no trailing period. */
    title: string;
    /** Optional one-line description under the title. 1 sentence, max 12 words. */
    detail?: string | null;
  }[];
}

export function AgendaList({ id, eyebrow, heading, items }: AgendaListProps) {
  return (
    <section
      id={id ?? undefined}
      className="flex min-h-screen w-full flex-col justify-center bg-background px-6 py-24 md:px-16"
    >
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <div className="mb-12 md:mb-16">
            {eyebrow ? (
              <p className="mb-4 text-xs font-semibold tracking-[0.28em] text-primary uppercase">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="font-display text-5xl font-bold tracking-tight text-balance md:text-7xl">
              {heading}
            </h2>
          </div>
        </Reveal>
        <Stagger className="flex flex-col" step={0.09}>
          {items.map((item, i) => (
            <div
              key={i}
              className={cn(
                'group flex items-baseline gap-6 border-t border-border py-6 md:gap-12 md:py-8',
                i === items.length - 1 && 'border-b',
              )}
            >
              <span className="font-display text-3xl font-bold tabular-nums text-primary md:text-5xl">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex flex-1 flex-col gap-1">
                <span className="font-display text-2xl font-semibold tracking-tight md:text-4xl">
                  {item.title}
                </span>
                {item.detail ? (
                  <span className="text-base text-muted-foreground md:text-lg">
                    {item.detail}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export const AgendaListDemo: AgendaListProps = {
  eyebrow: 'Agenda',
  heading: 'What we will cover',
  items: [
    { title: 'The Problem', detail: 'Why field work still runs on paper.' },
    { title: 'Our Solution', detail: 'One live map of every job.' },
    { title: 'Traction', detail: 'Where we are after eighteen months.' },
    { title: 'The Market', detail: 'A category waiting to be defined.' },
    { title: 'The Ask', detail: 'What we are raising and why now.' },
  ],
};
