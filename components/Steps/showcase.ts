import type { StepsProps } from './Steps';

// Canvas cases for the lab and for check.mjs. The base case mirrors
// `StepsDemo` in Steps.tsx rather than importing it: this file runs from the
// catalog, where the section's `@/` imports do not resolve, so it must stay
// free of value imports. Keep the two literals in step.
const StepsDemo: StepsProps = {
  id: 'pilot',
  eyebrow: '05 · Pilot plan',
  headline: 'A 12-week pilot with five enterprise design partners',
  body: 'The schedule and participant count are planning assumptions, with partners still to be recruited.',
  steps: [
    { when: 'Weeks 1–3', title: 'Interviews and workflow mapping', body: 'Observe current reporting workflows and choose the reports to test.' },
    { when: 'Weeks 4–8', title: 'A limited prototype', body: 'Weekly feedback sessions on a prototype covering the chosen reports.' },
    { when: 'Weeks 9–12', title: 'Evaluation', body: 'Reporting time, repeat usage, accuracy and willingness to pay against targets agreed before the start.' },
  ],
  variant: 'timeline',
};

export const StepsShowcase: { label: string; props: StepsProps }[] = [
  { label: 'Timeline', props: StepsDemo },
  { label: 'Numbered, muted', props: { ...StepsDemo, variant: 'numbered', background: 'muted' } },
];
