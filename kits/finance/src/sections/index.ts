// Public section catalog for the Finance system. The renderer imports this
// barrel as a namespace and looks sections up by `type` string.
//
// The ORDER of `export * from` lines below is the canonical composition
// chain — what a complete fintech page looks like, top to bottom. Rearrange
// the lines to reorder the chain.
export * from './Navbar';
export * from './Hero';
export * from './Metrics';
export * from './Features';
export * from './Performance';
export * from './Security';
export * from './Pricing';
export * from './CTA';
export * from './Footer';
