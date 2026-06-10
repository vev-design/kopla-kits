# The kit contract

What this repo guarantees to consumers (the Kopla app, the MCP tools,
anyone copying a kit), and what consumers assume about kits. Breaking
anything here is a **major version** bump — consumers pin an exact
version and upgrade deliberately.

## Workspace model

- A kit workspace is `{ ..._base, ...<kit> }` — kit files win on path
  collisions. `kit.json` is metadata, never materialized.
- Kits should only **add** files (sections + `globals.css` + README).
  Shadowing a `_base` file is technically supported by the overlay
  merge but discouraged: the demo's import resolver and humans both
  assume `_base` files mean what they say.
- `_base` intentionally ships `.gitignore` as part of the workspace
  (the workspace is itself a git repo). This is why the published
  artifact is a JSON bundle, not an npm-packed file tree — `npm pack`
  strips `.gitignore`.

## Required kit files

| File | Purpose |
| --- | --- |
| `kit.json` | Gallery manifest: `name`, `description` (short card copy), `whenToUse` (detailed selection guidance for AI/agents), `tags[]`, `featured`, `order` required; `accent`, `thumbnail` optional. Slug = folder name, `^[a-z0-9][a-z0-9-]*$`. |
| `src/globals.css` | Tailwind v4 entry (`@import "tailwindcss"`) carrying the kit's `:root` tokens — the kit's token DECLARATION (see below). Font families must be Google-Fonts-resolvable (consumers load the first family of each `--font-*` to render type specimens). |
| `src/sections/index.ts` | Barrel of `export * from './X';` lines. **Line order is the canonical composition chain** (and the demo parses exactly that single/double-quoted form). |
| `README.md` | System rationale — parsed by `extract-design.mjs` into `design.json`. |

## Section conventions

- Named function exports; props interface extends `SectionBaseProps`
  (`_base/src/types.ts`) and renders `id` on the root element.
- Every section exports a `<Name>Demo: <Name>Props` object with
  realistic demo content — the demo site renders sections from it.
- JSDoc on props is load-bearing: `extract-design.mjs` turns it into
  `design.json`, the machine-readable API surface of the kit.
- Imports: `@/components/ui/*`, `@/motion`, `@/lib/utils`, `@/types`
  from `_base`; npm deps only via `_base/package.json`.

## Toolchain contract

For every kit, the assembled workspace must pass:

```
bun install && bun run build   # gen:design → tsc --noEmit → Bun.build + tailwind
```

producing `dist/library.js`, `dist/theme.css`, and `design.json`.
CI (`scripts/build-kit.mjs --all`) enforces this on every PR.

## Tokens

A kit **declares its tokens** via `src/globals.css`; the declaration is
**derived, never hand-authored** — `_base/scripts/lib/tokens.mjs` parses
it identically everywhere it's needed:

- in-workspace: `extract-design.mjs` → `design.json.tokens`
- at pack time: `pack-kits.mjs` → `manifest.tokens` (`{ base, dark? }`,
  unprefixed custom-property names), so tokens are visible at SELECTION
  time — galleries, the MCP, create flows — before any workspace exists.

`base` = the `:root` block ∪ authored `@theme` `--font-*` tokens ∪ the
`spacing` density dial; `--color-*` aliases and the derived `--radius-*`
scale are excluded (not independent knobs). `dark` is present only when
the kit ships a `.dark` variant. Every kit must declare a non-empty
`base` (pack-time error otherwise).

**Essentials convention**: the knobs every system has — `primary`,
`background`, `foreground`, `radius`, plus every declared `font-*` —
are the subset consumers surface prominently (MCP `list_kits` returns
exactly these as `tokenEssentials`); the rest is the long tail for the
agent/chat to adjust.

## Published artifact

`@kopla/design-system-kits` exports one file:

```
./kits-bundle.json → { formatVersion: 1,
                       base: { "<relpath>": "<base64>" },
                       kits: { "<slug>": { manifest, files } } }
```

- `formatVersion` bumps with the shape, not the content.
- Excluded from packing: `node_modules`, `dist*`, `.DS_Store`,
  `pnpm-lock.yaml`, `.gitkeep`, `kit.json`.
- The `blank` kit must always exist — consumers use it as the default
  fallback when no kit is specified.
