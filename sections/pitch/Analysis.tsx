import type { ReactNode } from 'react';
import { Chart } from '@/components';
import { Columns, PitchFrame, Prose } from './pitch-primitives';
import { composeFrame, pitchTheme } from './pitch-composition';

/** One chart on an analysis page: what the Chart component draws, named by the author. */
export interface AnalysisChart {
  /** Sentence-case title from the finding, 3–10 words. */
  title: string;
  /** Geometry for the relationship in the data. */
  variant?: 'bar' | 'stacked-bar' | 'line' | 'pie' | 'donut' | 'scatter' | 'bubble';
  /** Named observations; one finite value per category, or x/y points. */
  series: { name: string; role?: 'focus' | 'context' | 'categorical' | 'positive' | 'negative' | 'other'; values: (number | null)[] | { x: string | number; y: number | null; size?: number }[] }[];
  /** Category order from the source. */
  categories?: string[];
  /** Vertical axis unit, 1–5 words. */
  yLabel?: string;
  /** Horizontal axis unit, 1–5 words. */
  xLabel?: string;
  /** Attribution: source, publisher, date. 3–20 words. */
  source?: string;
}

/**
 * A pitch section that argues with evidence: narrative on the left, the
 * charts that carry it on the right. One, two or three charts; with three,
 * two stack beside one tall. The charts lead — the words explain them.
 */
export interface AnalysisProps {
  /** Stable anchor id, rendered as the root element's `id`. kebab-case, no leading '#'. */
  id?: string | null;
  /** Small label above the title naming the section's place in the pitch, e.g. "Market evaluation". 1–3 words. */
  kicker?: string | null;
  /** The section's claim, as a sentence the reader could agree with. One line, two at most. */
  title: string;
  /** The narrative: a small heading over a paragraph, 1–4 blocks, each body 30–80 words. */
  paragraphs: { heading?: string | null; body: string }[];
  /** The evidence: 1–3 charts, in reading order. */
  charts: AnalysisChart[];
  /** The one sentence this section lands, drawn in the takeaway region. */
  takeaway?: string | null;
  /** What kind of sentence the takeaway is; chooses the lead-in word. */
  takeawayKind?: 'implication' | 'recommendation' | 'takeaway' | 'next' | null;
  /** Running footer facts the brand may draw: the document's title, a confidentiality note, the client, the date. Same values on every section of a pitch. */
  running?: { title?: string | null; note?: string | null; client?: string | null; date?: string | null } | null;
  /** This section's page number, and the page count when known. */
  page?: { index: number; total?: number | null } | null;
  /** The brand's mark for the frame, when the design system passes one. */
  logo?: ReactNode;
}

function Evidence({ charts }: { charts: AnalysisChart[] }) {
  const figure = (c: AnalysisChart, i: number) => <Chart key={i} title={c.title} variant={c.variant ?? 'bar'} series={c.series} categories={c.categories} yLabel={c.yLabel} xLabel={c.xLabel} source={c.source} />;
  if (charts.length >= 3) {
    return <Columns gap={24}>
      <div data-rank="support" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>{charts.slice(0, 2).map(figure)}</div>
      <div data-rank="lead">{charts.slice(2, 3).map(figure)}</div>
    </Columns>;
  }
  if (charts.length === 2) return <Columns gap={24}><div data-rank="lead">{figure(charts[0] as AnalysisChart, 0)}</div><div data-rank="support">{figure(charts[1] as AnalysisChart, 1)}</div></Columns>;
  return <div data-rank="lead">{charts.map(figure)}</div>;
}

export function Analysis({ id, kicker, title, paragraphs, charts, takeaway, takeawayKind, running, page, logo }: AnalysisProps) {
  return (
    <PitchFrame id={id} kicker={kicker} title={title} takeaway={takeaway} takeawayKind={takeawayKind} running={running ?? undefined} page={page} logo={logo} theme={pitchTheme} compose={composeFrame}>
      <Columns widths={[1, 2.3]} gap={40}>
        <Prose blocks={paragraphs} theme={pitchTheme} />
        <Evidence charts={charts} />
      </Columns>
    </PitchFrame>
  );
}

export const AnalysisDemo: AnalysisProps = {
  kicker: 'Market evaluation',
  title: 'Private label has taken six points of share while category growth stalled',
  paragraphs: [
    { heading: 'Volume has not moved', body: 'Category volume in the core aisles is flat since 2021. The growth retailers report is price, and the price increases have landed on the branded tier while private label held its shelf price for two years.' },
    { heading: 'The gap is at shelf', body: 'Shoppers now rate private label at parity on taste and quality in three of five categories. Where parity is reached, Caldera loses share within two quarters, and the loss has not reversed in any category yet.' },
  ],
  charts: [
    { title: 'Share of category volume', variant: 'bar', categories: ['Snacks', 'Sauces', 'Ready meals', 'Bakery', 'Frozen', 'Drinks'], series: [{ name: 'Caldera', role: 'focus', values: [38, 41, 29, 33, 24, 19] }, { name: 'Private label', role: 'context', values: [31, 27, 34, 30, 35, 22] }], yLabel: 'Share, %', source: 'Retailer scan data, 52 weeks to June 2026' },
    { title: 'Price index versus private label', variant: 'bar', categories: ['Snacks', 'Sauces', 'Ready meals', 'Bakery', 'Frozen', 'Drinks'], series: [{ name: 'Caldera', role: 'focus', values: [128, 121, 134, 119, 141, 126] }, { name: 'Category average', role: 'context', values: [112, 108, 117, 105, 122, 110] }], yLabel: 'Index, private label = 100', source: 'Shelf price audit, June 2026' },
    { title: 'Perceived quality, private label versus Caldera', variant: 'line', categories: ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'], series: [{ name: 'Caldera', role: 'focus', values: [71, 72, 72, 70, 69, 68, 67, 66] }, { name: 'Private label', role: 'context', values: [48, 51, 55, 58, 61, 64, 66, 67] }, { name: 'Category leader', role: 'other', values: [74, 74, 75, 75, 76, 76, 77, 77] }], yLabel: 'Top-two-box, %', source: 'Consumer tracker, n=2,400 per wave' },
  ],
  takeaway: 'Margin recovery has to start with a reason to choose Caldera at shelf, not with price',
  takeawayKind: 'implication',
  running: { title: 'Caldera Foods: recovering 340 bps of EBITDA margin', note: 'This information is confidential and was prepared solely for the use of our client; it is not to be relied on by any third party without prior written consent', date: 'September 2026' },
  page: { index: 10, total: 21 },
};
