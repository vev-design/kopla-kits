// Public section catalog. The renderer in App.tsx imports this barrel
// as a namespace and looks up sections by `type` string at render time:
//
//   import * as Sections from './sections';
//   const Component = Sections[section.type];
//   <Component {...section.props} />
//
// The blank kit is a BARE CANVAS: it ships tokens + structure only, no
// content. The catalog is intentionally empty — the architect authors every
// section from scratch on the first run, with nothing pre-styled to unlearn.
// Each one becomes a `./SectionName` file re-exported here; the order of those
// `export * from` lines is the recommended composition chain, top to bottom.
export {};
