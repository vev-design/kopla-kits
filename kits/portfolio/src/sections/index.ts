// Public section catalog. The renderer imports this barrel as a namespace
// and looks up sections by `type` string at render time.
//
// The ORDER of `export * from` lines below is the canonical composition
// chain — what a portfolio reads like top to bottom. Rearrange to reorder.
export * from './Intro';
export * from './WorkGrid';
export * from './ProjectFeature';
export * from './About';
export * from './Contact';
export * from './Footer';
