// Token extraction from a kit's src/globals.css — the kit's machine-readable
// token DECLARATION. Pure (string in, object out) so every consumer parses
// tokens identically:
//
//   scripts/extract-design.mjs   → design.json.tokens (in-workspace, at build)
//   the repo's pack scripts      → manifest.tokens   (at pack time, so kit
//                                  tokens are visible at SELECTION time —
//                                  galleries, MCP, create flows — before any
//                                  workspace exists)
//
// Shape: { base, dark? }. `base` is the always-applied scheme: the `:root`
// block (brand colors, radius) PLUS the kit's authored `@theme inline`
// font tokens — minus the `--color-*: var(...)` aliases, which are Tailwind
// plumbing, not design knobs. `dark` is the optional `.dark` block, present
// only when the system ships a dark variant. Keys are UNPREFIXED custom
// property names (`primary`, `font-sans`, `radius`, …).

/** Parse a kit's globals.css into its token declaration, or null when the
 *  CSS declares nothing. */
export function collectTokensFromCss(css) {
  // Strip /* */ comments first so a stray brace inside a comment can't end a
  // block early, and commented-out declarations aren't captured.
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  // Match `:root` / `.dark` at a selector boundary, allowing a compound tail
  // before the `{` (e.g. `:root:where(.x) {`, a real Tailwind v4 / shadcn
  // form). `[^{};]*` stops at the brace and won't cross a block/declaration.
  const root = readVarBlock(css, /(^|[\s,}]):root(?:[^{};]*)\{/) ?? {};
  const theme = readVarBlock(css, /@theme\b[^{]*\{/) ?? {};
  const dark = readVarBlock(css, /(^|[\s,}])\.dark(?:[^{};]*)\{/);

  // base = :root (colors + --radius) ∪ the authored @theme font tokens.
  // We surface only `--font-*` from @theme: the `--color-*` entries are
  // var() aliases and the `--radius-*` entries derive from :root's --radius,
  // so neither is an independent, live-overridable knob. Fonts are
  // (the base layer applies `font-family: var(--font-sans)`).
  const base = { ...root };
  for (const [name, value] of Object.entries(theme)) {
    if (!name.startsWith('font-')) continue;
    if (name in base) continue; // :root takes precedence
    base[name] = value;
  }
  // `--spacing` is Tailwind v4's spacing-scale base. It isn't authored in
  // source, but every spacing utility resolves to `calc(var(--spacing) * n)`,
  // so it's a live density dial worth exposing — seed its Tailwind default.
  if (!('spacing' in base)) base.spacing = '0.25rem';

  if (Object.keys(base).length === 0 && !dark) return null;
  return { base, ...(dark ? { dark } : {}) };
}

/** Find the first selector matching `re` and parse `--name: value;` pairs
 *  from its brace-balanced body. Returns null when absent or empty.
 *  Assumes comments have already been stripped from `css`. */
function readVarBlock(css, re) {
  const m = re.exec(css);
  if (!m) return null;
  const braceStart = css.indexOf('{', m.index);
  if (braceStart === -1) return null;
  let depth = 0;
  let end = -1;
  for (let i = braceStart; i < css.length; i++) {
    const ch = css[i];
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) {
      end = i;
      break;
    }
  }
  if (end === -1) return null;
  const body = css.slice(braceStart + 1, end);
  const vars = {};
  const declRe = /--([\w-]+)\s*:\s*([^;]+);/g;
  let d;
  while ((d = declRe.exec(body))) {
    vars[d[1]] = d[2].trim();
  }
  return Object.keys(vars).length > 0 ? vars : null;
}
