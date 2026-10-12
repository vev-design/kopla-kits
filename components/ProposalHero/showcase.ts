import type { ProposalHeroProps } from './ProposalHero';

// Canvas cases for the lab and for check.mjs. The base case mirrors
// `ProposalHeroDemo` in ProposalHero.tsx rather than importing it: this file runs from the
// catalog, where the section's `@/` imports do not resolve, so it must stay
// free of value imports. Keep the two literals in step.
const ProposalHeroDemo: ProposalHeroProps = {
  id: 'top',
  eyebrow: 'Business proposal · Fictional scenario',
  title: 'Fjord Insights',
  subtitle: 'An enterprise reporting opportunity',
  body: 'We propose launching a reporting and planning offering for enterprise customers, bringing financial performance, product adoption and customer feedback into one shared experience with the underlying evidence close at hand.',
  note: 'This is a fictional company and demonstration dataset. All figures are scenario data rather than actual results or validated forecasts.',
  cta: { label: 'Explore the opportunity', href: '#opportunity' },
  variant: 'typographic',
};

/** Static canvas cases: the three variants and the inverse band. */
export const ProposalHeroShowcase: { label: string; props: ProposalHeroProps }[] = [
  { label: 'Typographic', props: ProposalHeroDemo },
  {
    label: 'Figure-led',
    props: { ...ProposalHeroDemo, variant: 'figure', figure: { value: 'EUR 1.7m', label: 'Quarterly revenue, Q4 2026' } },
  },
  {
    label: 'Image-led',
    props: {
      ...ProposalHeroDemo,
      variant: 'image',
      image: { kind: 'image', src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80', alt: 'People collaborating in a light-filled studio' },
    },
  },
  { label: 'Inverse, centered', props: { ...ProposalHeroDemo, background: 'inverse', align: 'center', note: null } },
];
