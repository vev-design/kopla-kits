// Literal showcase states: what the check renders and the component view shows.
// Plain JSON values only — no ReactNodes, no functions.
import { FeesDemo, type FeesProps } from './Fees';

export type PitchShowcaseEntry = { label: string; main: 'Fees'; props: FeesProps };

export const PitchShowcase: PitchShowcaseEntry[] = [
  { label: 'Fees with terms', main: 'Fees', props: FeesDemo },
  { label: 'Fees, table only', main: 'Fees', props: { ...FeesDemo, notes: null, takeaway: null } },
];
