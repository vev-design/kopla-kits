import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';
import { cn } from '@/lib/utils';
import { archetypeSlots } from './archetype-slots';

/**
 * Exact source figures in a semantic table. One column may be highlighted as
 * the one the finding is about. The brand wraps the table through the
 * `tableFrame` slot (archetype-slots.tsx).
 */
export interface EvidenceTableProps extends SectionBaseProps {
  /** Section number and evidence category. 2–6 words. */
  eyebrow?: string | null;
  /** The finding. 4–10 words. */
  headline: string;
  /** Context. 1–3 sentences, 20–65 words. */
  body?: string | null;
  /** Column headings, 2–6 labels, each 1–8 words; the first identifies the row. */
  columns: string[];
  /** Source rows, 2–18 items; each cell matches the column order and keeps the supplied formatting. */
  rows: {
    /** Cells in column order, 2–6 short values. */
    cells: string[];
  }[];
  /** Zero-based index of the column the finding is about; omit for none. */
  highlightColumn?: number | null;
  /** The conclusion. 1–2 sentences, 15–55 words; omit for none. */
  takeaway?: string | null;
  /** Source and method. 1–4 sentences; omit for none. */
  footnote?: string | null;
  /** Band treatment; defaults to muted. */
  background?: 'default' | 'muted' | 'accent' | 'inverse';
  /** Vertical padding; defaults to default. */
  spacing?: 'compact' | 'default' | 'spacious';
  /** Remove the small label. */
  hideEyebrow?: boolean;
}

const BACKGROUND = {
  default: 'bg-background text-foreground',
  muted: 'bg-muted text-foreground',
  accent: 'bg-primary text-primary-foreground',
  inverse: 'bg-foreground text-background',
} as const;
const SPACING = {
  compact: 'py-12 md:py-16',
  default: 'py-20 md:py-28',
  spacious: 'py-28 md:py-40',
} as const;
type Background = keyof typeof BACKGROUND;
type Spacing = keyof typeof SPACING;

export function EvidenceTable({
  id,
  eyebrow,
  headline,
  body,
  columns,
  rows,
  highlightColumn,
  takeaway,
  footnote,
  background = 'muted',
  spacing = 'default',
  hideEyebrow,
}: EvidenceTableProps) {
  const table = (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm md:text-base">
        <caption className="sr-only">{headline}</caption>
        <thead>
          <tr className="border-b-2 border-current/40">
            {columns.map((column, c) => (
              <th
                key={c}
                scope="col"
                className={cn('px-3 py-3 align-bottom text-xs font-semibold uppercase tracking-[0.12em]', c > 0 && 'text-right', c === highlightColumn && 'bg-current/5')}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-b border-current/15">
              {row.cells.map((cell, c) =>
                c === 0 ? (
                  <th key={c} scope="row" className="px-3 py-3 font-semibold">
                    {cell}
                  </th>
                ) : (
                  <td key={c} className={cn('px-3 py-3 text-right tabular-nums', c === highlightColumn && 'bg-current/5 font-semibold')}>
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  return (
    <section id={id ?? undefined} className={cn('w-full', BACKGROUND[background as Background], SPACING[spacing as Spacing])}>
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <Reveal className="max-w-3xl">
          {!hideEyebrow && eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{eyebrow}</p>
          ) : null}
          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">{headline}</h2>
          {body ? <p className="mt-5 text-lg leading-relaxed">{body}</p> : null}
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          {archetypeSlots.tableFrame?.(table) ?? table}
        </Reveal>
        {takeaway ? <p className="mt-8 max-w-3xl text-lg font-semibold leading-snug">{takeaway}</p> : null}
        {footnote ? <p className="mt-4 max-w-3xl text-sm leading-relaxed opacity-70">{footnote}</p> : null}
      </div>
    </section>
  );
}

export const EvidenceTableDemo: EvidenceTableProps = {
  id: 'financials',
  eyebrow: '06 · Scenario evidence · Financials',
  headline: 'Eight quarters of financial performance',
  body: 'The table brings together quarterly revenue, operating costs, operating profit, operating margin and revenue growth versus the previous quarter.',
  columns: ['Quarter', 'Revenue (EUR)', 'Operating costs (EUR)', 'Operating profit (EUR)', 'Operating margin', 'Growth vs. prior'],
  rows: [
    { cells: ['Q1 2025', '860,000', '740,000', '120,000', '14.0%', '—'] },
    { cells: ['Q2 2025', '965,000', '805,000', '160,000', '16.6%', '12.2%'] },
    { cells: ['Q3 2025', '1,060,000', '850,000', '210,000', '19.8%', '9.8%'] },
    { cells: ['Q4 2025', '1,195,000', '920,000', '275,000', '23.0%', '12.7%'] },
    { cells: ['Q1 2026', '1,285,000', '990,000', '295,000', '23.0%', '7.5%'] },
    { cells: ['Q2 2026', '1,405,000', '1,050,000', '355,000', '25.3%', '9.3%'] },
    { cells: ['Q3 2026', '1,535,000', '1,120,000', '415,000', '27.0%', '9.3%'] },
    { cells: ['Q4 2026', '1,700,000', '1,210,000', '490,000', '28.8%', '10.8%'] },
  ],
  highlightColumn: 4,
  takeaway: 'Operating margin is 14.0% in Q1 2025 and 28.8% in Q4 2026.',
  footnote: 'Operating profit equals revenue minus operating costs. Operating margin equals operating profit divided by revenue. Fictional scenario data.',
};
