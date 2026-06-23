import { Badge } from '@/components/Badge';
import { Reveal, Stagger } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * A calm weekly class schedule grouped by day. Each day lists its classes with
 * a time, a class name, and an instructor. Clean and quietly spaced so the week
 * is easy to scan. Use after the philosophy section to help visitors plan a
 * visit.
 */
export interface ScheduleProps extends SectionBaseProps {
  /** Small label above the heading. 1–3 words, sentence case (e.g. "This week"). */
  eyebrow?: string | null;
  /** Section heading. 1 sentence, 3–7 words, no trailing period. */
  heading: string;
  /** Supporting line under the heading. 1 sentence, 10–24 words. */
  subhead?: string | null;
  /** Days of the week with their classes. 3–7 items, in weekday order. */
  days: {
    /** Day name. 1 word (e.g. "Monday"). */
    day: string;
    /** Classes on this day. 1–4 items, ordered earliest to latest. */
    classes: {
      /** Start time. Short, max 8 chars (e.g. "7:00 AM"). */
      time: string;
      /** Class name. 1–3 words, sentence case (e.g. "Morning flow"). */
      name: string;
      /** Instructor's first name or full name. 1–2 words (e.g. "Mira"). */
      instructor: string;
    }[];
  }[];
}

export function Schedule({ id, eyebrow, heading, subhead, days }: ScheduleProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background">
      <div className="mx-auto w-full max-w-4xl px-6 py-24">
        <Reveal className="mb-14 flex flex-col items-center gap-4 text-center">
          {eyebrow ? <Badge variant="soft">{eyebrow}</Badge> : null}
          <h2 className="max-w-2xl font-serif text-4xl font-semibold tracking-tight text-balance md:text-5xl">
            {heading}
          </h2>
          {subhead ? (
            <p className="max-w-xl text-lg text-muted-foreground text-pretty">
              {subhead}
            </p>
          ) : null}
        </Reveal>
        <Stagger className="flex flex-col gap-4">
          {days.map((day) => (
            <div
              key={day.day}
              className="grid gap-4 rounded-xl border border-border bg-card p-6 md:grid-cols-[8rem_1fr] md:gap-8 md:p-8"
            >
              <h3 className="font-serif text-2xl font-semibold tracking-tight">
                {day.day}
              </h3>
              <ul className="flex flex-col divide-y divide-border">
                {day.classes.map((cls) => (
                  <li
                    key={`${cls.time}-${cls.name}`}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="w-20 shrink-0 text-sm font-semibold text-primary tabular-nums">
                        {cls.time}
                      </span>
                      <span className="font-semibold">{cls.name}</span>
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {cls.instructor}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export const ScheduleDemo: ScheduleProps = {
  eyebrow: 'This week',
  heading: 'A rhythm for your week',
  subhead:
    'Drop in whenever suits you. Classes are kept small, so we recommend reserving your mat ahead.',
  days: [
    {
      day: 'Monday',
      classes: [
        { time: '7:00 AM', name: 'Morning flow', instructor: 'Mira' },
        { time: '6:30 PM', name: 'Restorative', instructor: 'Joon' },
      ],
    },
    {
      day: 'Wednesday',
      classes: [
        { time: '8:00 AM', name: 'Slow flow', instructor: 'Elena' },
        { time: '12:30 PM', name: 'Breathwork', instructor: 'Mira' },
        { time: '7:00 PM', name: 'Meditation', instructor: 'Sol' },
      ],
    },
    {
      day: 'Friday',
      classes: [
        { time: '7:00 AM', name: 'Morning flow', instructor: 'Elena' },
        { time: '5:30 PM', name: 'Prenatal', instructor: 'Joon' },
      ],
    },
    {
      day: 'Saturday',
      classes: [
        { time: '9:00 AM', name: 'Slow flow', instructor: 'Sol' },
        { time: '11:00 AM', name: 'Restorative', instructor: 'Mira' },
      ],
    },
  ],
};
