# Building ONE component

You are importing a **single component** into this design system's component
catalog — not a page, not a section, not a theme. Build exactly the one
component described below, then stop. The build **auto-surfaces** it (generates
the catalog barrel, reads your variant axes, lists it in the component view), so
you only write the component file + record its provenance. Another process
assembles every component and publishes.

## What you receive

- **A variant inventory** — the component's axes (e.g. `variant`, `size`,
  `state`) with values + defaults, and each variant's **exact** styles (colors,
  spacing, radii, type) from Figma. These exact values are the ground truth —
  use them verbatim, not the screenshot.
- **A screenshot** — for layout / structure / which state is which.
- **A color → token map** — for each Figma variable color, the CSS token to use
  (e.g. `var(--primary)`). Use the mapped token; for a color NOT in the map, use
  its exact value as a component-scoped value (a local var / inline) — never
  invent a token.
- **Base components** (when this one nests others) — already at
  `src/components/<Base>.tsx`. **Import and use them** (`import { Base } from
  './Base'`); never re-create a base.

## Build it

1. Create `src/components/<Name>.tsx`: a typed `*Props` interface with **one prop
   per variant axis** (a string-union of every value, with the default), plus
   content props. **Define the variants with `cva`** — the build reads your
   `cva` config to populate the component's variant axes. Render **every** state
   (incl. focus / disabled) using each variant's exact values; reference colors
   via the mapped tokens, fall back to component-scoped values for unmapped ones.
2. Record provenance in `components.manifest.json` — append ONE entry
   `{ name, origin, showcase }` (`origin` = the Figma provenance you were given;
   `showcase` = one entry per state worth previewing). Append only; leave other
   entries alone.
3. `bun run build` ONCE to confirm it type-checks + bundles. Fix errors, done.

## Never

- **Never edit `src/globals.css`** — the theme/tokens are owned elsewhere and a
  crafted set must not be touched. Need a value that isn't a mapped token? Scope
  it to your component.
- **Never edit `src/sections/`, the catalog barrel (`_components.ts`),
  `design.json`, `README.md`, or the composition chain** — the build surfaces
  your component automatically; you only write `src/components/<Name>.tsx` + the
  manifest entry.
- **Never re-create a base component** you were told exists — import it.
- **Never build more than the one component** named in your task.

Everything else about the kit (stack, primitives, `cn()`, motion, shadcn) is in
`AGENTS.md`.
