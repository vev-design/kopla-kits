// Library entry — the design system's public surface.
//
// A design system is a plain React component library. It exports its
// section components — the host runtime imports these as the "registry"
// and renders pages from a `sections` array — AND its reusable catalog
// components (Button, …), which the host's component canvas imports by
// name (`mod[componentName]`) to render the variant matrix. Both must be
// exported here, or a component listed in `design.json.components`
// renders as "(missing)". The library knows nothing about the host.
//
// The theme (`dist/theme.css`) is built separately by the Tailwind CLI —
// see scripts/build.mjs — and linked by consumers alongside this module.
export * from './sections';
export * from './components';
