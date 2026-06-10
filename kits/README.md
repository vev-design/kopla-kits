# Design-system kits

Curated starting points for new design systems. A consumer picks a kit,
and its workspace starts from that kit's section set + theme instead of
a single neutral hero — the starting point steers the output toward the
chosen style.

## Layout

```
kits/
  _base/            Shared, kit-invariant substrate (framework + toolchain +
                    primitives). NOT a kit; never picked directly.
  blank/            A kit. Each kit is an OVERLAY on _base.
    kit.json        Gallery metadata (name, description, tags, featured, order)
    README.md       System name / description / composition rationale
    src/globals.css Theme tokens (the kit's look)
    src/sections/   Section catalog + index.ts (composition order)
  <slug>/           More kits…
```

A kit workspace is `{ ..._base, ...<kit> }` — kit files win on path
collisions. The tree is packed into the published artifact by
`scripts/pack-kits.mjs`. See `../CONTRACT.md` for the full consumer
contract.

## kit.json

```jsonc
{
  "name": "Blank",                       // display name in the gallery
  "description": "One or two sentences.", // short gallery card copy
  "whenToUse": "A detailed paragraph.",    // selection guidance for AI/agents:
                                           // use cases, tone, and what the kit
                                           // is NOT for (see existing kits)
  "tags": ["Minimal", "Neutral"],        // chips on the card
  "featured": true,                       // show in the "Featured" row
  "order": 0,                             // sort within its group (lower first)
  "accent": "#5B5BD6",                   // optional card accent
  "thumbnail": "/kit-thumbnails/blank.svg" // optional preview image (consumer-hosted)
}
```

The **slug** is the folder name (`blank`, `saas`, …) — not a field in
`kit.json`. Consumers store the slug and use it to pick the right overlay.

## Managing kits

- **Add**: copy a kit folder, rename it (the new slug), edit `kit.json`,
  author `src/globals.css` + `src/sections/`. The demo picks it up on the
  next `pnpm --filter @kopla/kits-demo dev`; consumers pick it up on the
  next published version.
- **Remove**: delete the folder. (`blank` can never be removed — it's the
  consumers' fallback kit.)
- **Feature / order**: edit `featured` / `order` in `kit.json`.

Each kit must build on its own — `{ _base + kit }` has to pass
`npm run build` (tsc + esbuild + Tailwind + design.json). The blank kit is
the reference for the contract; see `_base/AGENTS.md` for the section
authoring rules.

## Tokens & schemes

A kit's `src/globals.css` is the source of truth for its tokens.
`_base/scripts/extract-design.mjs` surfaces them into `design.json.tokens`
so hosts can read + override them without re-parsing CSS:

- `tokens.base` — the always-applied scheme: the `:root` block (brand colors,
  `--radius`) plus the kit's authored `@theme inline` font tokens, plus
  `--spacing` (Tailwind's density dial). The `--color-*` aliases and derived
  `--radius-*` scale are skipped (not independent knobs).
- `tokens.dark` — present only when the kit ships a `.dark` block.

**Kits are single-scheme by default** — author ONE coherent look in `:root`
(light *or* dark; the deck kit is dark, editorial is light). Do **not** add
a `.dark` block by default; a dark variant is an opt-in addition on top of
the base look. See `_base/AGENTS.md` for the authoring rule.
