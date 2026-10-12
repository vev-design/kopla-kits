import type { NarrativeProps } from './Narrative';

// Canvas cases for the lab and for check.mjs. The base case mirrors
// `NarrativeDemo` in Narrative.tsx rather than importing it: this file runs from the
// catalog, where the section's `@/` imports do not resolve, so it must stay
// free of value imports. Keep the two literals in step.
const NarrativeDemo: NarrativeProps = {
  id: 'solution',
  eyebrow: '03 · The proposed solution',
  headline: 'One shared workspace for financial, adoption and feedback reporting',
  body: 'The offering would hold quarterly financial summaries, revenue breakdowns, adoption comparisons and customer sentiment in one place. Charts and tables would include concise explanations linked to their source figures, making it easier to review the evidence behind a statement.',
  items: [
    { label: 'Scope', title: 'Financial summaries with source figures', body: 'Quarterly revenue, costs and margin, each statement linked to the table it comes from.' },
    { label: 'Scope', title: 'Adoption beside satisfaction', body: 'Seat adoption and survey results for the same accounts, so the two can be read together.' },
    { label: 'Scope', title: 'Sentiment over time', body: 'Response categories including non-response, never collapsed into a single score.' },
  ],
  note: 'These capabilities are the proposed product scope. They are not existing capabilities or validated customer demand.',
  variant: 'cards',
};

export const NarrativeShowcase: { label: string; props: NarrativeProps }[] = [
  { label: 'Cards', props: NarrativeDemo },
  { label: 'Ruled list, muted', props: { ...NarrativeDemo, variant: 'ruled', background: 'muted' } },
  { label: 'Columns, centered, inverse', props: { ...NarrativeDemo, variant: 'columns', align: 'center', background: 'inverse' } },
];
