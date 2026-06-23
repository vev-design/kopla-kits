// Public section catalog for the Restaurant system. The renderer imports
// this barrel as a namespace and looks sections up by `type` string.
//
// The ORDER of `export * from` lines below is the canonical composition
// chain — what a complete restaurant page looks like, top to bottom.
// Rearrange the lines to reorder the chain.
export * from './Navbar';
export * from './Hero';
export * from './MenuList';
export * from './Story';
export * from './Gallery';
export * from './Hours';
export * from './Reservation';
export * from './Footer';
