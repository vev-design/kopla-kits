// Shape rules over an emitted PropType, kept out of extract-design.mjs so they
// can be tested without a TypeScript server.
//
// Everything here is JSON in, JSON out. The extractor's own code is a CLIENT of
// an out-of-process compiler (lib/ts.mjs), so a rule expressed inside it can
// only be exercised by materializing a workspace and building it; the same rule
// over the catalog it produces is a truth table.

/**
 * A union of exactly the `true` and `false` literals IS boolean.
 *
 * TypeScript models the intrinsic `boolean` as `true | false`, so an OPTIONAL
 * flag (`autoplay?: boolean`) reaches the union branch as three constituents,
 * loses `undefined` to the nullable wrapper, and emitted as
 * `nullable → union(literal false, literal true)`. Nothing downstream reads
 * that as a boolean: the inspector's `PropField` draws the union's first option,
 * which is a `literal` — a read-only pill. So every optional flag any design
 * system has ever declared has been uneditable, silently, and looking like a
 * deliberate display of a value rather than a broken control.
 *
 * Returns the collapsed type, or null when the options are not that pair (a
 * single literal, `true | true`, a boolean mixed with something else) — the
 * caller keeps the union it built.
 */
export function booleanFromLiteralOptions(options) {
  if (!Array.isArray(options) || options.length !== 2) return null;
  if (!options.every((o) => o && o.kind === 'literal' && typeof o.value === 'boolean')) return null;
  return options[0].value === options[1].value ? null : { kind: 'boolean' };
}
