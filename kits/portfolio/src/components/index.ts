// Portfolio component catalog: the _base defaults this kit adopts plus the
// kit's own token-themed primitives. This file SHADOWS _base/src/components/
// index.ts — the assembled workspace uses this one, and the extractor reads it
// into design.json.components. Export order is catalog order.
export * from './ui/button'; // _base default (present after the overlay merge)
export * from './Badge';
export * from './Stat';
