// Library entry — the design system's public surface.
//
// A design system is a plain React component library: it exports its
// section components (and nothing else). The host runtime imports
// these as the "registry" and renders pages from a `sections` array.
// The library knows nothing about the host.
//
// The theme (`dist/theme.css`) is built separately by the Tailwind CLI —
// see scripts/build.mjs — and linked by consumers alongside this module.
export * from './sections';
