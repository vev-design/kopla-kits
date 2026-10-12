import type { EvidenceTableProps } from './EvidenceTable';

// Canvas cases for the lab and for check.mjs. The base case mirrors
// `EvidenceTableDemo` in EvidenceTable.tsx rather than importing it: this file runs from the
// catalog, where the section's `@/` imports do not resolve, so it must stay
// free of value imports. Keep the two literals in step.
const EvidenceTableDemo: EvidenceTableProps = {
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

export const EvidenceTableShowcase: { label: string; props: EvidenceTableProps }[] = [
  { label: 'Financials, highlighted margin', props: EvidenceTableDemo },
  {
    label: 'Short, default band',
    props: {
      ...EvidenceTableDemo,
      id: 'sentiment',
      headline: 'Customer responses, including non-response',
      body: null,
      columns: ['Response', 'Customers', 'Share of invited customers'],
      rows: [
        { cells: ['Positive', '624', '62.4%'] },
        { cells: ['Neutral', '216', '21.6%'] },
        { cells: ['Negative', '120', '12.0%'] },
        { cells: ['No response', '40', '4.0%'] },
      ],
      highlightColumn: null,
      takeaway: 'There are 960 responses from 1,000 invitees, giving a 96.0% response rate.',
      background: 'default',
    },
  },
];
