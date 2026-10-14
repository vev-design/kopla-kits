// Literal showcase states: what the check renders and the component view shows.
// Plain JSON values only — no ReactNodes, no functions.
import { FeesDemo, type FeesProps } from './Fees';
import { AnalysisDemo, type AnalysisProps } from './Analysis';

export type PitchShowcaseEntry =
  | { label: string; main: 'Fees'; props: FeesProps }
  | { label: string; main: 'Analysis'; props: AnalysisProps };

export const PitchShowcase: PitchShowcaseEntry[] = [
  { label: 'Fees with terms', main: 'Fees', props: FeesDemo },
  { label: 'Fees, table only', main: 'Fees', props: { ...FeesDemo, notes: null, takeaway: null } },
  { label: 'Analysis, three charts', main: 'Analysis', props: AnalysisDemo },
  { label: 'Analysis, one chart', main: 'Analysis', props: { ...AnalysisDemo, charts: AnalysisDemo.charts.slice(2, 3), takeaway: null } },
];
