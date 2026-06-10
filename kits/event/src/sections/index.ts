// Public section catalog. The renderer imports this barrel as a namespace
// and looks up sections by `type` string at render time.
//
// The ORDER of `export * from` lines below is the canonical composition
// chain — what an event page reads like top to bottom. Rearrange to reorder.
export * from './EventHero';
export * from './Speakers';
export * from './Schedule';
export * from './Tickets';
export * from './Sponsors';
export * from './Footer';
