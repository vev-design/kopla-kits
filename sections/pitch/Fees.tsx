import type { ReactNode } from 'react';
import { Bullets, Columns, KeyValues, Panel, PitchFrame } from './pitch-primitives';
import { composeFrame, pitchTheme } from './pitch-composition';

/**
 * A pitch section stating what the work costs: a priced table of lines, and
 * beside it the terms that go with the price. The table leads. One section
 * per pitch, late in the deck.
 */
export interface FeesProps {
  /** Stable anchor id, rendered as the root element's `id`. kebab-case, no leading '#'. */
  id?: string | null;
  /** Small label above the title naming the section's place in the pitch, e.g. "Commercials". 1–3 words. */
  kicker?: string | null;
  /** The section's claim, as a sentence the reader could agree with. One line. */
  title: string;
  /** Heading on the price table, e.g. "Fees". 1–2 words. */
  heading?: string | null;
  /** The priced lines, in the order they are offered. 2–8 rows; `value` is the formatted price or term. */
  rows: { label: string; value: string }[];
  /** Terms beside the table: billing, what the client provides, what is optional. 0–6 short sentences. Omit to give the table the full width. */
  notes?: string[] | null;
  /** The one sentence this section lands, drawn in the footer band. */
  takeaway?: string | null;
  /** What kind of sentence the takeaway is; chooses the band's lead-in word. */
  takeawayKind?: 'implication' | 'recommendation' | 'takeaway' | 'next' | null;
  /** Running footer facts: a confidentiality note, the client, the date. */
  running?: { note?: string | null; client?: string | null; date?: string | null } | null;
  /** The brand's mark for the footer, when the design system passes one. */
  logo?: ReactNode;
}

export function Fees({ id, kicker, title, heading, rows, notes, takeaway, takeawayKind, running, logo }: FeesProps) {
  const table = <Panel rank="lead" heading={heading} theme={pitchTheme}><KeyValues rows={rows} theme={pitchTheme} /></Panel>;
  return (
    <PitchFrame id={id} kicker={kicker} title={title} takeaway={takeaway} takeawayKind={takeawayKind} running={running ?? undefined} logo={logo} theme={pitchTheme} compose={composeFrame}>
      {notes?.length
        ? <Columns widths={[6.4, 5.6]}>{table}<Bullets items={notes} theme={pitchTheme} /></Columns>
        : table}
    </PitchFrame>
  );
}

export const FeesDemo: FeesProps = {
  kicker: 'Commercials',
  title: 'Fixed fee of $1.4M for the 8-week diagnostic',
  heading: 'Fees',
  rows: [
    { label: 'Core diagnostic, eight weeks', value: '$1,400,000' },
    { label: 'Customer profitability module', value: '$220,000' },
    { label: 'Pricing tool prototype', value: '$310,000' },
    { label: 'Expenses, at cost', value: 'Capped at 8%' },
  ],
  notes: [
    'Billed in three instalments: start, week four, week eight',
    'Caldera provides transaction-level pricing and trade data by day three',
    'A named Caldera counterpart is available half-time for the duration',
    'Optional modules priced at week 6 checkpoint and are not committed now',
  ],
  takeaway: 'Confirm by 5 September to hold the September start and the quoted fee',
  takeawayKind: 'recommendation',
  running: { note: 'This information is confidential and was prepared solely for the use of our client; it is not to be relied on by any third party without prior written consent' },
};
