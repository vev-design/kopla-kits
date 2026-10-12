import type { QuoteProps } from './Quote';

// Canvas cases for the lab and for check.mjs. The base case mirrors
// `QuoteDemo` in Quote.tsx rather than importing it: this file runs from the
// catalog, where the section's `@/` imports do not resolve, so it must stay
// free of value imports. Keep the two literals in step.
const QuoteDemo: QuoteProps = {
  id: 'quote',
  quote: 'We spend the first week of every quarter assembling reports that disagree with each other before anyone can ask a question about the business.',
  name: 'Illustrative enterprise customer',
  role: 'Head of operations, fictional scenario',
  variant: 'standout',
};

export const QuoteShowcase: { label: string; props: QuoteProps }[] = [
  { label: 'Standout', props: QuoteDemo },
  {
    label: 'Editorial with portrait',
    props: {
      ...QuoteDemo,
      variant: 'editorial',
      background: 'muted',
      image: { kind: 'image', src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', alt: 'Portrait of a person' },
    },
  },
  { label: 'Inverse, left', props: { ...QuoteDemo, background: 'inverse', align: 'left' } },
];
