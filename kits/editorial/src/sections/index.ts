// Public section catalog. The renderer imports this barrel as a namespace
// and looks up sections by `type` string at render time.
//
// The ORDER of `export * from` lines below is the recommended composition
// chain for this system — what a canonical longform page looks like, top
// to bottom. Rearrange the lines to reorder the chain.
export * from './Masthead';
export * from './ArticleHero';
export * from './ImageText';
export * from './PullQuote';
export * from './GalleryGrid';
export * from './Newsletter';
export * from './Footer';
