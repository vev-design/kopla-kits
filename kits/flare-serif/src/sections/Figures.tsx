import { Reveal } from '@/motion';
import { Eyebrow, Rule } from '@/components';
import type { SectionBaseProps } from '@/types';

/**
 * The two numeral tokens, set against each other so the difference is
 * arguable rather than theoretical: oldstyle figures sitting on the x-height
 * inside a sentence, and lining tabular figures aligning down a column. Most
 * systems ship one numeral style and use it everywhere; this section exists to
 * make the split explicit, because a table set in oldstyle figures will not
 * align and a sentence set in tabular figures reads like a receipt.
 *
 * @hydrate
 */
export interface FiguresProps extends SectionBaseProps {
  /** Tracked caps label. 1–3 words. */
  eyebrow?: string | null;
  /** Section heading. 3–7 words, no trailing period. */
  heading: string;
  /** A sentence containing several numbers, to show oldstyle figures in prose. 1–2 sentences, 20–40 words, must include digits. */
  prose: string;
  /** The column that has to align. 3–5 rows. */
  rows: {
    /** Row label. 1–3 words. */
    label: string;
    /** The figure. Digits with optional unit or separator, max 10 characters. */
    value: string;
  }[];
  /** Caption under the table. 1 sentence, 8–18 words. */
  tableNote?: string | null;
}

export function Figures({ id, eyebrow, heading, prose, rows, tableNote }: FiguresProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-card py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-6">
        <Reveal className="measure mb-16">
          {eyebrow ? <Eyebrow className="mb-5">{eyebrow}</Eyebrow> : null}
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.05] font-bold text-foreground uppercase [letter-spacing:var(--tracking-caps)]">
            {heading}
          </h2>
        </Reveal>
        <div className="grid gap-16 md:grid-cols-2 md:gap-20">
          <Reveal>
            <p className="font-sans text-[0.625rem] font-semibold uppercase [letter-spacing:var(--tracking-label)] text-muted-foreground">
              Oldstyle · in running text
            </p>
            <Rule weight="hair" className="mt-4 mb-8" />
            <p className="nums-text measure font-sans text-xl leading-[1.7] text-foreground text-pretty md:text-2xl">
              {prose}
            </p>
          </Reveal>
          <Reveal>
            <p className="font-sans text-[0.625rem] font-semibold uppercase [letter-spacing:var(--tracking-label)] text-muted-foreground">
              Tabular · in columns
            </p>
            <Rule weight="hair" className="mt-4 mb-8" />
            <table className="w-full">
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-border">
                    <th
                      scope="row"
                      className="py-4 text-left font-sans text-sm font-normal text-muted-foreground"
                    >
                      {row.label}
                    </th>
                    <td className="nums-table py-4 text-right font-wedge text-xl font-semibold text-foreground md:text-2xl">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tableNote ? (
              <p className="mt-5 font-sans text-xs leading-relaxed text-muted-foreground">
                {tableNote}
              </p>
            ) : null}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export const FiguresDemo: FiguresProps = {
  eyebrow: 'Numerals',
  heading: 'Two figure styles, two jobs',
  prose:
    'The first cutting was released in 1897 and re-drawn twice before 1920, when the foundry finally settled on the 12 pt master that every later size was derived from.',
  rows: [
    { label: 'Desktop license', value: '240' },
    { label: 'Web, per domain', value: '1,150' },
    { label: 'App embedding', value: '3,600' },
    { label: 'Full family', value: '4,890' },
  ],
  tableNote: 'Figures align because they are tabular, not because the column is narrow.',
};
