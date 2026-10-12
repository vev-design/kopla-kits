import type { EvidenceChartProps } from './EvidenceChart';

// Canvas cases for the lab and for check.mjs. The base case mirrors
// `EvidenceChartDemo` in EvidenceChart.tsx rather than importing it: this file runs from the
// catalog, where the section's `@/` imports do not resolve, so it must stay
// free of value imports. Keep the two literals in step.
const EvidenceChartDemo: EvidenceChartProps = {
  id: 'segment-revenue',
  eyebrow: '02 · Scenario evidence · Revenue',
  headline: 'Enterprise contributes the largest revenue increase',
  body: 'Enterprise revenue rises from EUR 420,000 in Q1 2025 to EUR 960,000 in Q4 2026. Mid-market revenue moves from EUR 280,000 to EUR 465,000, while small-business revenue moves from EUR 160,000 to EUR 275,000.',
  takeaway: 'The first-to-last-quarter increases are EUR 540,000 for enterprise, EUR 185,000 for mid-market and EUR 115,000 for small business.',
  chartTitle: 'Quarterly revenue by customer segment',
  variant: 'stacked-bar',
  categories: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'],
  series: [
    { name: 'Enterprise', role: 'focus', values: [420000, 480000, 540000, 630000, 690000, 760000, 850000, 960000] },
    { name: 'Mid-market', role: 'context', values: [280000, 310000, 330000, 355000, 375000, 405000, 430000, 465000] },
    { name: 'Small business', role: 'other', values: [160000, 175000, 190000, 210000, 220000, 240000, 255000, 275000] },
  ],
  yLabel: 'Revenue (EUR)',
  footnote: 'Stacked values show quarterly revenue in whole euros across three customer segments. Fictional scenario data.',
  layout: 'split',
};

export const EvidenceChartShowcase: { label: string; props: EvidenceChartProps }[] = [
  { label: 'Split, stacked bar', props: EvidenceChartDemo },
  {
    label: 'Full width, line',
    props: {
      ...EvidenceChartDemo,
      id: 'revenue-costs',
      layout: 'full',
      variant: 'line',
      headline: 'Revenue and operating costs both increase across the period',
      chartTitle: 'Revenue and operating costs',
      series: [
        { name: 'Revenue', role: 'focus', values: [860000, 965000, 1060000, 1195000, 1285000, 1405000, 1535000, 1700000] },
        { name: 'Operating costs', role: 'context', values: [740000, 805000, 850000, 920000, 990000, 1050000, 1120000, 1210000] },
      ],
    },
  },
  {
    label: 'Compact, donut',
    props: {
      ...EvidenceChartDemo,
      id: 'revenue-mix',
      layout: 'compact',
      variant: 'donut',
      headline: 'Enterprise accounts for more than half of Q4 2026 revenue',
      chartTitle: 'Revenue mix, Q4 2026',
      categories: ['Enterprise', 'Mid-market', 'Small business'],
      series: [{ name: 'Revenue', values: [960000, 465000, 275000] }],
      yLabel: null,
      background: 'muted',
    },
  },
];
