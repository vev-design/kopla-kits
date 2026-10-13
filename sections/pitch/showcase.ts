// Literal showcase states: what the check renders and the component view shows.
// Plain JSON values only — no ReactNodes, no functions.
import { FeesDemo, type FeesProps } from './Fees';

export interface PitchShowcaseEntry {
  label: string;
  main: 'Fees';
  props: FeesProps;
}

export const PitchShowcase: PitchShowcaseEntry[] = [
  { label: 'Fees with terms', main: 'Fees', props: FeesDemo },
  { label: 'Fees, table only', main: 'Fees', props: { ...FeesDemo, notes: null, takeaway: null } },
  {
    label: 'Fees, long lines',
    main: 'Fees',
    props: {
      ...FeesDemo,
      title: 'A fixed fee for the diagnostic, with optional modules priced only once the week-six checkpoint has confirmed where the value is',
      rows: [
        { label: 'Core diagnostic across pricing, trade investment and cost to serve, eight weeks, including the steering committee read-outs', value: '$1,400,000' },
        { label: 'Expenses', value: 'At cost, capped at 8% of professional fees' },
      ],
      notes: ['A named counterpart on the client side, available half-time, with authority to release transaction-level pricing and trade data by the end of the first week'],
    },
  },
];
