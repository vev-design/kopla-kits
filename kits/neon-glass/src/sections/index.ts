// Public section catalog for the Neon Glass system. The renderer imports
// this barrel as a namespace and looks sections up by `type` string.
//
// The ORDER of `export * from` lines below is the canonical composition
// chain — what a complete Neon Glass page looks like, top to bottom.
// Rearrange the lines to reorder the chain.
export * from './Navbar';
export * from './Hero';
export * from './FeatureGrid';
export * from './Showcase';
export * from './StatRow';
export * from './Testimonial';
export * from './Pricing';
export * from './CTA';
export * from './Footer';
