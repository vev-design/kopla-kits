// Public section catalog. The renderer in App.tsx imports this barrel
// as a namespace and looks up sections by `type` string at render time:
//
//   import * as Sections from './sections';
//   const Component = Sections[section.type];
//   <Component {...section.props} />
//
// The ORDER of `export * from` lines below is the recommended composition
// chain for this system — what a canonical page looks like, top to
// bottom. Rearrange the lines to reorder the chain.
export * from './Hero';
