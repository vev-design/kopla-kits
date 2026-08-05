// Public section catalog. The renderer imports this barrel as a namespace
// and looks up sections by `type` string at render time.
//
// The ORDER of `export * from` lines below is the canonical composition
// chain for this system — what a page looks like, top to bottom. Rearrange
// the lines to reorder the chain.
export * from './Navbar';
export * from './Hero';
export * from './Marquee';
export * from './Grid';
export * from './Stat';
export * from './Testimonial';
export * from './CTA';
export * from './Footer';
