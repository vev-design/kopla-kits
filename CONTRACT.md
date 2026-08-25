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
  assume `_base` files mean what they say. The one deliberate exception
  is `src/components/` (see **Components**) — a kit owns its component
  catalog there, including its own `src/components/index.ts`.
- `_base` intentionally ships `.gitignore` as part of the workspace
  (the workspace is itself a git repo). This is why the published
  artifact is a JSON bundle, not an npm-packed file tree — `npm pack`
  strips `.gitignore`.

## The toolchain travels; the design source does not

A consumer materializes a workspace once and keeps it — its sections, its
components, its `globals.css` are the customer's copy, and picking a kit is a
DETACH: nothing in this repo is ever pushed over them again. What a consumer
does refresh from the pinned ref is the build tooling (`scripts/build.mjs`,
`scripts/extract-design.mjs`), so a bug fixed here reaches systems that were
seeded months ago.

That asymmetry is a rule for authors of `scripts/`: **a change to the build
tooling must work against a workspace materialized at an OLDER ref.** Read what
is on disk rather than what the current `_base` would have put there. The
Tailwind entry is the worked example — v1.6.0 moved it from `src/globals.css`
to `src/index.css`, so `build.mjs` compiles `index.css` when it exists and
`globals.css` when it doesn't, and an old workspace keeps the exact sheet it
had.

The hydration walk already satisfies this by construction, and it is the shape
to copy: `extract-design.mjs` does not hardcode whether `@/motion` needs client
JS, it FOLLOWS the import and reads the wrappers on disk. So a workspace on the
old JS wrappers is still correctly hydrated by today's extractor, and one on the
CSS wrappers publishes static. Detect, don't assert.

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
- Imports: `@/components/ui/*`, `@/motion`, `@/lib/*`, `@/types`
  from `_base`; npm deps only via `_base/package.json`.

### Which exports need client JS

`design.json.hydrateSections` is a flat array of the export names — sections
and components together — that cannot work as static HTML. **It is the
contract for hosts**: a consumer decides whether a page ships JavaScript by
testing its section names against this list, and must not walk
`sections[].hydrate` / `components[].hydrate` itself. Those per-entry flags
remain for authoring visibility, but a host that re-shuffles the two barrels
(some lift named exports from `sections` into `components` when they publish)
will lose them; a list of names survives that untouched.

The array is always present, empty included, so a host can distinguish "this
system declares its hydration needs, and there are none" from "this bundle
predates the field".

An export lands in the list when it carries an `@hydrate` JSDoc tag on its
Props, or when `extract-design.mjs` finds evidence in its AST — a stateful
React hook call, a JSX event handler, an animation-lib import — in the file or
anything it imports in-workspace. Sections built on native primitives
(`<details name>`, `popover`, CSS scroll-snap) stay out of the list, which is
the outcome to aim for: no JS to ship and no flag to get wrong.

### Media must stay pointable

A host editor finds the image a person is editing by **hit-testing the cursor**
and walking the paint stack — not by reading `design.json`. Two class choices
make a picture unreachable, and neither shows up in a screenshot:

- `pointer-events-none` **on the media element**: it is absent from the hit test
  entirely, so the image cannot even be selected.
- a decorative layer over it **without** `pointer-events-none`: a gradient scrim,
  colour wash or hover tint at `absolute inset-0` swallows the pointer, so the
  image below never learns it was hovered.

Either way the host's "Change image" affordance never appears and a
fully-propped image reads as uneditable — worst on the full-bleed heroes where
the image IS the section. So: **mark every decorative layer `pointer-events-none
aria-hidden`, and leave the `<img>` / `bg-cover` element hit-testable.**

```tsx
<img src={image} alt="" className="absolute inset-0 size-full object-cover" />
<div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/70 to-background" />
```

`check-media-editable.mjs` checks both rules over `src/**/*.tsx` on every build.

## Variants & blocks

Two graded ways a section offers controlled variation. Both live in the
props type — so `design.json` carries them, and consumers (editor UI,
page agents) can only pick what the kit author enumerated.

- **Section variants** — an optional enum prop named `variant`
  (e.g. `variant?: 'image-left' | 'image-right'`). The name is a
  convention consumers key on: the Kopla editor renders a prop named
  `variant` as a first-class switcher. Use it for layout/arrangement
  flips; use other enum props for orthogonal knobs (density, tone).
- **Block slots** — a prop typed as a discriminated union of block
  props from `_base`'s `@/components/blocks` (discriminant: the literal
  `kind` field). Blocks are _base-owned, token-themed content units
  (`image`, `video`, `chart` today; form, … later). A section narrows the
  union to exactly the kinds it can host —
  `media: ImageBlockProps | ChartBlockProps` — and renders the slot with
  `<MediaBlock media={…} />` (or the individual block components).
  Adding a block to `_base` never widens an existing section's slot;
  each section opts in explicitly.
- Demo values for block slots must be **inline object literals** in the
  `<Name>Demo` export — the demo extractor reads literals only, so
  don't reference shared constants.
- Blocks must stay static (no client JS) unless documented otherwise; a
  section hosting a block that animates or hydrates must carry the
  `@hydrate` tag itself.

## Components

Alongside sections, a kit declares a **component catalog** — the reusable
primitives a system is built from (Button, Badge, Card, …), distinct from
page sections. Consumers (the Kopla editor's component canvas) surface these
in their own view; a kit with no catalog leaves that view empty.

Components are **design-system identity**, so a kit **owns its catalog**:

- `_base` ships a minimal, unopinionated, **token-themed default layer**
  (`Button` today). These are defaults — the floor that guarantees every kit
  renders and gives sections something to import — not a mandate to use them
  as-is.
- A kit owns **`src/components/index.ts`** (the sibling of the sections
  barrel; it **shadows** `_base`'s). It re-exports the `_base` defaults the
  kit adopts and adds the kit's own primitives:

  ```ts
  // <kit> catalog: _base defaults this kit uses + its own primitives.
  export * from '@/components/ui/button'; // a _base default (resolved via the overlay)
  export * from './Badge';                // kit-owned
  export * from './Card';                 // kit-owned
  ```

  Export order is catalog order. A kit may also **shadow** a `_base` primitive
  (e.g. its own `Button`) by adding the file — the catalog reflects whatever
  the assembled `src/components/index.ts` re-exports.
- Each component is a named React component with a typed `*Props` interface,
  authored like a section (JSDoc → description, JSDoc per prop → prop docs,
  `@kind` overrides, `@hydrate` opt-in). **Declare variant axes as explicit
  string-union props** (e.g. `variant?: 'default' | 'outline'`) — the extractor
  turns each enum prop into a variant axis for the canvas matrix, so don't hide
  them behind a library generic (`VariantProps<…>`).
- Components must stay **token-themed**: style them with the same token-backed
  utilities sections use (`bg-primary`, `border`, `rounded-*`, `font-*`, …) so a
  component renders in each system's own look with no per-system code. Extracting
  an inline primitive into a component must not change its rendered classes —
  the system looks exactly as it did before.
- Provide a sibling **`<Name>Showcase`** export — an array of `{ props, label? }`
  static object literals (the analogue of a section's `<Name>Demo`) naming the
  states worth previewing. The extractor reads literals only.
- `extract-design.mjs` reads the assembled `src/components/index.ts` and emits
  `design.json.components[]` (`ComponentDefinition`: `name`/`description`/`props`/
  `origin`/`axes?`/`showcase?`/`hydrate?`), with `origin` always
  `{ kind: 'generated' }`. Components live in their own barrel, so `sections` and
  the composition chain are unaffected. The field is omitted when a kit exports
  no components.

**Authoring guide.** This section is the build-time contract — how
`extract-design.mjs` turns a kit's `src/components/` into
`design.json.components`. The agent-facing step-by-step for authoring one
component (including importing from Figma) is `_base/AGENTS.components.md`, and
it follows exactly this contract: components declared in `src/components/index.ts`,
variant axes from explicit string-union props, preview states from
`<Name>Showcase`. Provenance beyond `origin: generated` (e.g. a Figma
`fileKey`/`nodeId`) is the host import pipeline's concern, not the kit build's.

## Advanced components (top-level `components/`)

Alongside `kits/`, the repo carries a **kit-agnostic catalog of advanced
components** — prebuilt, token-themed implementations of behavior that is
easy to get wrong (scroll-driven storytelling, animated counters,
marquees, …). They are **copy-in** components: a consumer (usually an
agent) copies the source into a workspace's `src/components/` and
registers one barrel line; the copy then forks with the workspace,
exactly like any other catalog component. `components/AGENTS.md` is the
agent-facing copy-in guide.

- One folder per component: `components/<Name>/` (PascalCase) with
  `component.json` (metadata: `name` = folder, `description`,
  `whenToUse`, `tags[]`, `hydrate`, `vendor[]` — all required) and
  `<Name>.tsx`, the copy-in source. `component.json` is metadata, never
  materialized — same rule as `kit.json`.
- Components follow the kit component contract above (typed JSDoc'd
  `*Props`, explicit string-union variant axes, `<Name>Showcase`,
  token-themed styling, `@hydrate` opt-in) so the copied file surfaces
  into `design.json.components` with **no rework**.
- **No npm dependencies beyond `_base`'s.** A component that needs a
  third-party lib ships it as pinned, pre-bundled code in a
  `<Name>.vendor/` folder (relative imports, so the copy stays
  verbatim), recorded in `component.json.vendor` as
  `{ pkg, version, license }` entries — the auditable record of what's
  inside the blob. `vendor: []` when nothing is vendored.
- CI: `scripts/build-components.mjs` assembles blank ∪ every component
  (the exact copy-in) and runs the real toolchain, then asserts each
  component surfaced in `design.json.components`.
- Packed additively into the published bundle under a `components` key
  (`{ "<Name>": { manifest, files } }`); consumers that predate the key
  ignore it, so adding it was not a `formatVersion` bump.

## Toolchain contract

For every kit, the assembled workspace must pass:

```
bun install && bun run build   # gen:design → check:media → tsc --noEmit
                               # → Bun.build + tailwind
```

producing `dist/library.js`, `dist/theme.css`, and `design.json`.
CI (`scripts/build-kit.mjs --all`) enforces this on every PR.

`check:media` (`check-media-editable.mjs`) is advisory in a consumer's workspace
and **enforced here** — CI sets `KOPLA_MEDIA_STRICT=1`, which promotes its
warnings to errors. See "Media must stay pointable" below.

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
