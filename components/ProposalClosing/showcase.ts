import type { ProposalClosingProps } from './ProposalClosing';

// Canvas cases for the lab and for check.mjs. The base case mirrors
// `ProposalClosingDemo` in ProposalClosing.tsx rather than importing it: this file runs from the
// catalog, where the section's `@/` imports do not resolve, so it must stay
// free of value imports. Keep the two literals in step.
const ProposalClosingDemo: ProposalClosingProps = {
  id: 'ask',
  eyebrow: 'The ask',
  statement: 'Approve a discovery phase to validate the problem',
  body: 'The next proposal would name an accountable owner, estimate staffing and delivery costs, and set measurable success targets before development begins.',
  cta: { label: 'Discuss the discovery phase', href: '#top' },
  contact: 'Illustrative contact, fictional scenario',
  variant: 'contrast',
};

export const ProposalClosingShowcase: { label: string; props: ProposalClosingProps }[] = [
  { label: 'Contrast', props: ProposalClosingDemo },
  { label: 'Quiet, centered', props: { ...ProposalClosingDemo, variant: 'quiet', align: 'center', contact: null } },
];
