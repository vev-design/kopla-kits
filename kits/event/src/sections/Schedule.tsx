import { cn } from '@/lib/utils';
import { Badge } from '@/components';
import type { SectionBaseProps } from '@/types';

/**
 * The agenda — a time-ordered list of sessions, each with a time, title, and
 * optional speaker + track tag. Use one Schedule per day.
 */
export interface ScheduleProps extends SectionBaseProps {
  /** Day / section label. 1–4 words, e.g. "Day one". */
  heading: string;
  /** Sessions, in order. 3–12 items. */
  sessions: {
    /** Start time. ~3–6 chars, e.g. "09:30". */
    time: string;
    /** Session title. 2–8 words. */
    title: string;
    /** Speaker name. 0–3 words. */
    speaker?: string | null;
    /** Track / type label. 1–2 words, e.g. "Keynote". */
    track?: string | null;
  }[];
}

export function Schedule({ id, heading, sessions }: ScheduleProps) {
  return (
    <section id={id ?? undefined} className="mx-auto w-full max-w-4xl px-6 py-20 md:py-28">
      <h2 className="mb-8 text-3xl font-bold tracking-tight md:text-4xl">{heading}</h2>
      <ul className="flex flex-col">
        {sessions.map((s, i) => (
          <li
            key={i}
            className={cn(
              'flex flex-col gap-1 border-t border-border py-4 sm:flex-row sm:items-baseline sm:gap-6',
              i === sessions.length - 1 && 'border-b',
            )}
          >
            <span className="shrink-0 font-mono text-sm tabular-nums text-muted-foreground sm:w-16">
              {s.time}
            </span>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="font-semibold">{s.title}</span>
              {s.speaker ? (
                <span className="text-sm text-muted-foreground">{s.speaker}</span>
              ) : null}
            </div>
            {s.track ? (
              <Badge tone="soft" size="tag" className="w-fit">
                {s.track}
              </Badge>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export const ScheduleDemo: ScheduleProps = {
  heading: 'Day one',
  sessions: [
    { time: '09:30', title: 'Doors + coffee', track: 'Break' },
    { time: '10:00', title: 'Opening keynote: the next decade of the web', speaker: 'Lena Park', track: 'Keynote' },
    { time: '11:15', title: 'Designing systems that survive contact with reality', speaker: 'Diego Ramos', track: 'Talk' },
    { time: '13:30', title: 'Workshop: shipping AI features users trust', speaker: 'Amara Osei', track: 'Workshop' },
    { time: '16:00', title: 'Lightning talks', track: 'Talk' },
  ],
};
