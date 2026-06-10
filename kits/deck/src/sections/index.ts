// Public section catalog. The renderer imports this barrel as a namespace
// and looks up sections by `type` string at render time.
//
// The ORDER of `export * from` lines below is the recommended composition
// chain for this presentation — what a canonical deck looks like, scrolled
// top to bottom. Rearrange the lines to reorder the chain.
export * from './TitleSlide';
export * from './AgendaList';
export * from './StatBig';
export * from './ImageFull';
export * from './QuoteSlide';
export * from './ClosingCTA';
