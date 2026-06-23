// Public section catalog for the Agency system. The renderer imports this
// barrel as a namespace and looks sections up by `type` string.
//
// The ORDER of `export * from` lines below is the canonical composition
// chain — what a complete agency page looks like, top to bottom. Rearrange
// the lines to reorder the chain.
export * from './Navbar';
export * from './Hero';
export * from './Services';
export * from './WorkGrid';
export * from './Process';
export * from './Stats';
export * from './ContactCTA';
export * from './Footer';
