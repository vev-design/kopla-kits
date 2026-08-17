// Public section catalog. The renderer imports this barrel as a namespace
// and looks up sections by `type` string at render time.
//
// The ORDER of `export * from` lines below is the recommended composition
// chain for this system — a specimen page, top to bottom: nameplate, the face
// at full size, the argument for it, then four sections that examine the
// drawing itself at descending scale, then the face applied to something real,
// and the ask. Rearrange the lines to reorder the chain.
export * from './Lockup';
export * from './SpecimenHero';
export * from './Manifesto';
export * from './WeightRamp';
export * from './Anatomy';
export * from './Alternates';
export * from './Figures';
export * from './InUse';
export * from './Enquiry';
export * from './Colophon';
