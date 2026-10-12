import type { StatBandProps } from './StatBand';

// Canvas cases for the lab and for check.mjs. The base case mirrors
// `StatBandDemo` in StatBand.tsx rather than importing it: this file runs from the
// catalog, where the section's `@/` imports do not resolve, so it must stay
// free of value imports. Keep the two literals in step.
const StatBandDemo: StatBandProps = {
  id: 'figures',
  eyebrow: 'Scenario evidence',
  headline: 'Enterprise carries the growth',
  stats: [
    { value: '540', currency: 'EUR', unit: 'k', label: 'Enterprise revenue increase', support: 'First to last quarter, Q1 2025 to Q4 2026.' },
    { value: '56.5', unit: '%', label: 'Share of Q4 2026 revenue', support: 'Enterprise, of EUR 1.7m total.' },
    { value: '28.8', unit: '%', label: 'Operating margin, Q4 2026', support: 'Up from 14.0% in Q1 2025.' },
    { value: '1,320', label: 'Active accounts', support: '500 more than the first quarter shown.' },
  ],
  variant: 'row',
};

export const StatBandShowcase: { label: string; props: StatBandProps }[] = [
  { label: 'Row of four', props: StatBandDemo },
  { label: 'Single figure', props: { ...StatBandDemo, variant: 'single', headline: null, stats: [StatBandDemo.stats[0]!] } },
  { label: 'Grid, inverse', props: { ...StatBandDemo, variant: 'grid', background: 'inverse' } },
];
