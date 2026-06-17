# Building ONE component

You are importing a **single component** into this design system's component
catalog — not a page, not a section, not a theme. Build exactly the one
component described below, then stop. Another process handles the rest of the
import and assembles everyone's work.

## What you receive

- **A variant inventory** — the component's axes (e.g. `variant`, `size`,
  `state`) with their values + defaults, and every concrete variant's **exact**
  styles (colors, spacing, radii, type) from Figma. These exact values are the
  ground truth — use them verbatim, don't eyeball the screenshot.
- **A screenshot** — for layout / structure / which state looks like what.
- **A color → token map** — for each Figma variable color, either a CSS token
  to use (e.g. `var(--primary)`) or a token that's already been added for you.
  Use the mapped token wherever a color is in the map; for any color NOT in the
  map, use its exact value as a component-scoped value (a local CSS var or an
  inline value) — never invent a token for it.
- **Base components** (when this one nests others) — already built at
  `src/components/<Base>.tsx`. **Import and use them** (`import { Base } from
  './Base'`); never re-create a base component.

## Build it

1. Create `src/components/<Name>.tsx`: a typed `*Props` interface with **one
   prop per variant axis** (a string-union of every value, with the default),
   plus content props. Render **every state** — including subtle ones (focus,
   disabled) — using each variant's exact per-state values.
2. Reference colors through the **color→token map** (`var(--…)`); fall back to
   exact component-scoped values for unmapped colors.
3. Re-export **your component** from `src/sections/index.ts`
   (`export { Name } from '../components/Name'`).
4. Record **your component** in `components.manifest.json` — append one entry
   `{ name, origin, showcase }` (`origin` = the Figma provenance you were given;
   `showcase` = one entry per state worth previewing). Append only; don't touch
   other entries.
5. `bun run build` ONCE to confirm it type-checks and bundles. Fix errors, then
   you're done.

## Never

- **Never edit `src/globals.css`** — the theme/tokens are owned elsewhere and a
  crafted token set must not be touched. If you need a value that isn't a mapped
  token, scope it to your component (a local var / inline value).
- **Never touch sections, the composition chain, or `README.md`** — this is a
  catalog component, not a page section. (After the build, `design.json` will
  list your component under `sections` and in the chain — that's EXPECTED and
  corrected automatically when the system publishes. Do **not** "fix" it, and do
  not inspect or reorder `design.json` / `src/sections/index.ts`.)
- **Never re-create a base component** you were told already exists — import it.
- **Never build more than the one component** named in your task.

Everything else about the kit (stack, primitives, `cn()`, motion, shadcn) is in
`AGENTS.md`.
