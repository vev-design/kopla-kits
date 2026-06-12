# Design System Starter Kit

You are implementing a design system in this workspace. The starter ships React 19 + Tailwind v4 + shadcn/ui + Motion + a generic renderer. Your job is to skin the theme, build the section set the user's prompt describes, and document the result in `README.md` and the section files themselves.

Runs are iterative. The workspace you receive may already have a `README.md` and section files from prior runs — that's the *previous* state of the system, not a finished spec. **Whatever you change in the code (add a section, rename one, shift the brand, reorder the composition), update `README.md` in the same run.** Stale READMEs are a regression.

## What this system produces: presentations

The output is a **presentation** — a long, scroll-driven, visual narrative, not a marketing landing page or a typical web app. Each section is a slide-like beat in a story the viewer scrolls through. Optimize accordingly:

- **Visually rich.** Big type, full-bleed imagery and video, generous whitespace, oversized numbers and stats, decorative geometry, gradients, color washes, layered compositions. Plain stacked blocks of copy are the failure mode — push for striking, editorial layouts.
- **Scroll-driven motion is the preferred animation language.** Reach for scroll-triggered reveals, parallax, sticky headers and pinned sections, scroll-linked transforms (scale / opacity / position tied to viewport progress), and number/text counters that animate as their section enters. Idle animations (looping background motion, slow drifts) are fine as accent — but the main motion vocabulary is "this happens as the viewer scrolls past."
- **One idea per section.** Each section has a single dominant focal point — a headline, a hero image, a stat, a quote — surrounded by supporting elements. Don't pack a section with five competing things.
- **Pacing through scale and density variation.** Alternate dense and sparse sections, intimate and expansive, image-led and type-led. The composition of section types is itself part of the design.
- **Use the full viewport.** Sections often want `min-h-screen` or `h-screen` for hero / pinned moments. Don't be shy about height — presentations breathe.

When picking the section set for a prompt, lean toward presentation primitives: full-bleed hero, pinned image-text, parallax media, stat callouts, pull quotes, large image grids, scroll-stepped feature reveals, animated number rollups, scroll-locked timelines, full-bleed video, closing CTA. Lean away from dense web-app primitives (toolbars, navbars, footers) unless the prompt explicitly asks for them.

## What you're building: sections, not primitives

The design system's **public surface area is sections** — page-level blocks that downstream consumers compose into pages. Examples: `Hero`, `Toolbar`, `Footer`, `ImageText`, `VideoBgText`, `FeatureGrid`, `Testimonial`, `CTA`, `StatsRow`, `PricingTable`. Cards, buttons, headings, etc. are still built — they're internal primitives that sections compose with — but they are NOT the public API.

Pick the section set from the user's prompt: which sections does this system need to make a complete, well-designed page for what they're describing? Don't ship a kitchen sink — ship the sections this brand / product actually needs, plus the universals (Toolbar, Footer, Hero, CTA).

### Section design rules

- **All editable content goes through props.** Headlines, body copy, CTA labels, image URLs, video URLs, list items — every dynamic value is a prop. Sections never hardcode user-facing strings.
- **Use `variant` for layout flips.** Don't ship `ImageTextLeft` and `ImageTextRight` as separate sections — ship one `ImageText` with `variant: 'image-left' | 'image-right'`. Same for centered vs left hero, dark vs light footer, two-column vs three-column grid, etc.
- **Type props precisely.** Discriminated unions where variants change which props are valid; arrays for repeating slots (FeatureGrid items, Testimonial quotes); `null` for optional media; clear union literals for variants. A downstream caller should be able to read the interface and immediately know what to fill in.
- **Use block slots for swappable media.** When a media column could hold more than one kind of content (a photo *or* a small chart), type the prop as a union of block props from `@/components/blocks` and render it with `<MediaBlock media={…} />` — e.g. `media: ImageBlockProps | ChartBlockProps`. Blocks are pre-built, token-themed, and static; only union in the kinds that fit the section's design. Demo values for a block slot are inline object literals (e.g. `media: { kind: 'chart', type: 'bar', data: [...] }`).
- **Sections own their composition.** Inside a section, freely compose shadcn primitives, Tailwind utilities, and motion wrappers. Externally, the only knobs are the documented props.
- **Sections are fluid.** `width: 100%`, no fixed sizes. Internal layout uses Tailwind's spacing scale and the theme's max-width tokens.
- **Expose an anchor `id`.** Every section's `*Props` interface must `extends SectionBaseProps` (from `@/types`), and the component must render that `id` on its **root element** (`<section id={id ?? undefined}>`). This makes each section an anchor target so menus, toolbars, and on-page nav can link to it via `#<id>`. Don't redeclare `id` — extending the base exposes it, and it appears in `design.json` for every section automatically. A nav/toolbar that links to other sections uses in-page `#<id>` hrefs (e.g. `{ label: 'Pricing', href: '#pricing' }`).

## How to author a section

Every section file declares its description, props, and demo in one place:

```tsx
import { Button } from '@/components/ui/button';
import type { SectionBaseProps } from '@/types';

/**
 * Top-of-page banner with one strong visual statement and an optional CTA.
 * Use as the first section above the fold.
 */
export interface HeroProps extends SectionBaseProps {
  /** Short uppercase label rendered above the headline. 1–3 words, no punctuation. */
  eyebrow?: string | null;
  /** Primary statement. 1 sentence, 4–10 words, no trailing period. */
  headline: string;
  /** Supporting sentence under the headline. 1–2 sentences, 12–28 words. */
  body?: string | null;
  /** Optional call-to-action button. */
  cta?: {
    /** Visible button label. 1–3 words, sentence case (e.g. "Get started"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  } | null;
  /** Layout variant. */
  variant?: 'centered' | 'left';
}

export function Hero({ id, headline, ... }: HeroProps) {
  // Root element carries the anchor id so menus can link via `#<id>`.
  return <section id={id ?? undefined}>{/* ...component... */}</section>;
}

export const HeroDemo: HeroProps = {
  eyebrow: 'Acme',
  headline: 'Realistic placeholder content.',
  cta: { label: 'Get started', href: '#' },
  variant: 'centered',
};
```

Rules:

- The **JSDoc above the `*Props` interface** is the section's description — one short paragraph (when to use, what it's for, what feel).
- **Every prop has a JSDoc line** — one helpful sentence per prop.
- **Pin length and shape for text props** in the JSDoc. Downstream AI generates the actual content from these descriptions, so vague docs ("the headline") yield vague text. Be specific: word or character ranges, sentence counts, casing, whether punctuation is allowed, list-item counts for arrays. Examples:
  - `/** Primary statement. 1 sentence, 4–10 words, no trailing period. */`
  - `/** Supporting paragraph. 2–3 sentences, 40–80 words. */`
  - `/** Stat figure. Number + optional unit, max 6 characters (e.g. "12M", "98%"). */`
  - `/** Feature list. 3–6 items. Each item: 1 sentence, max 12 words. */`
  - `/** Button label. 1–3 words, sentence case (e.g. "Get started"). */`
  When in doubt, err toward tighter ranges — too-long generated text breaks layouts; too-short usually doesn't.
- For string-shaped props that aren't plain text, add a **`@kind` tag**. Supported: `@kind url`, `@kind image`, `@kind richtext`. Without one, strings render as a text field.
- `?:` makes a prop **nullable** (the host lets the user clear it; your component's default kicks in). Make a prop required when there's no sensible "cleared" state.
- Every section exports a **`<Name>Demo`** const typed by its props interface. The literal must be static — no function calls or identifiers. For sections with multiple representative variants, export `<Name>Demo: <Name>Props[]` and each entry becomes a demo instance.
- **Re-export every section** from `src/sections/index.ts`. Only re-exported names are part of the system.

## How to author the README

`README.md` describes the system as a whole. Layout:

```md
# System Name

Long prose paragraph (or two) describing the system's character, brand fit,
and when to use it.

## Composition

Multi-paragraph rationale explaining *why* the composition order works —
e.g. how each section's role advances the story, which sections set tone
vs. carry content, where the visual rhythm lands. The chain itself is
not written here.
```

- The first `# H1` is the system name.
- The body up to the next `## H2` is the system description.
- The `## Composition` body is the rationale only. **The composition order is the order of `export * from './X'` statements in `src/sections/index.ts`** — rearrange those lines to reorder the chain. The build picks up the order automatically.
- Other H2 sections in the README are free-form — feel free to add notes for yourself.

The README must always reflect the system **as it is right now**:

- Added a section? Add the `export * from './NewSection'` line to `src/sections/index.ts` at the position it should appear in the chain; touch the rationale if its role changes the story.
- Removed or renamed a section? Remove or rename the `export * from` line in `index.ts`.
- Reordered the composition? Reorder the lines in `index.ts`.
- Reordered, restyled, or repurposed the system? Rewrite the description.
- The system name (H1) changed? Update it.

Treat `README.md` as part of the deliverable, not a one-time setup. Read it at the start of every run to see where the system left off, and rewrite the parts that no longer match by the end of the run.

## Tech stack

This kit is a **pure component library**, not an app. It exports section
components from `src/index.ts`; it has no entry HTML, no router, and no dev
server. The host runtime imports the built library and renders pages from a
`sections` array — your job is the components, not the page shell.

- **React 19** + **TypeScript** (ESM, strict mode). React is a *peer*
  dependency — it's provided by the runtime, never bundled.
- **Bun.build** bundles `src/index.ts` → `dist/library.js` (one ESM module,
  React external). No Vite, no esbuild, no dev server, no HTML shell.
- **Tailwind CSS v4** via `@tailwindcss/cli` → `dist/theme.css`. Theme tokens
  live as CSS custom properties in `src/globals.css` and are exposed to
  Tailwind through `@theme inline { ... }`.
- **shadcn/ui** for the primitive component layer. Components are copied into the repo under `src/components/ui/` via the `shadcn` CLI — they are your code, edit them freely.
- **Radix UI** primitives (pulled in as needed by shadcn components).
- **Motion** ([motion.dev](https://motion.dev), npm `motion`) for animation. Import from `motion/react`.
- **lucide-react** for icons.
- **bun** as package manager and script runner.
- Path alias **`@/*`** resolves to `src/*` (configured in `tsconfig.json`).

## Project structure

```
README.md                — System description (name, description, composition)
components.json          — shadcn CLI configuration

src/
  index.ts               — Library entry; re-exports every section. The
                           public API surface — DO NOT add page/render code.
  globals.css            — Tailwind import, theme tokens, base layer
  types.ts               — SectionBaseProps (the `id` contract sections extend)
  globals.d.ts           — *.css ambient declarations

  lib/
    utils.ts             — `cn()` helper (clsx + tailwind-merge)

  components/
    index.ts             — Barrel export for primitives
    ui/                  — shadcn primitives (added via the CLI)
      button.tsx
      ...

  sections/              — Public section catalog (the system's API)
    Hero.tsx             — Demo section; replace / add more
    index.ts             — Barrel; every section must be re-exported here

  motion/                — Animation wrappers (see motion/AGENTS.md)
    index.ts             — Barrel export
    constants.ts         — Shared duration / ease values
```

## Working with the starter kit

Treat the shipped shadcn/ui primitives and Tailwind v4 theme as a head start, not a constraint:

- **Re-skin** the system by editing the `:root` token block in `src/globals.css` — that's how brand color, radius, fonts, etc. flow into every primitive and section. The `@theme inline { ... }` block maps those CSS variables to Tailwind utility tokens (`bg-primary`, `text-muted-foreground`, `rounded-lg`).
- **Add primitives** with `bun run ui:add <name>` (alias for `bun x shadcn@latest add`). The CLI writes to `src/components/ui/<name>.tsx`, installs Radix deps, and uses the `cn()` helper. Full registry at <https://ui.shadcn.com/docs/components>. Don't hand-roll a primitive that exists in the registry.
- **Modify** generated primitives in place when the spec needs variants or behavior shadcn defaults don't cover. They're your code now.
- **Delete** primitives no section in this system uses.
- **Install** any third-party npm package the spec calls for — chart libraries, date pickers, form helpers, image utilities, animation extras. `bun add <pkg>` and import normally. Prefer maintained, popular packages; the bundle ships as a single ESM module so tree-shaking matters.
- **Compose** sections using shadcn primitives, Tailwind utilities, and motion wrappers. Use `cn()` from `@/lib/utils` to merge classes — never concatenate by hand.

### `src/index.ts` — the library entry

`src/index.ts` re-exports your sections (`export * from './sections'`) — that's the whole public API. There is no renderer or page component in this repo: the host runtime imports the built library and renders pages from a `sections` array of `{ type, props }`. Each section's `<Name>Demo` export is the example instance shown in the preview. Don't add an `App`/render entry — just author sections and keep `src/sections/index.ts` exporting them in canonical order.

### Theme — `src/globals.css`

All design decisions live as CSS custom properties on `:root` inside `globals.css`. The `@theme inline { ... }` block maps those variables to Tailwind theme tokens — that's what makes utilities like `bg-primary`, `text-muted-foreground`, `rounded-lg`, `font-sans` resolve to your brand values.

**Single-scheme by default.** Author ONE coherent look in `:root` — whatever the system calls for, light *or* dark. A pitch deck can be dark, an editorial site light; that's a `:root` choice, not a reason to ship both. **Do NOT add a `.dark` block by default.** A dark *variant* is opt-in — only add a `.dark` token block when the spec explicitly asks for a separate dark mode on top of the base look. (The host applies `class="dark"` when a dark variant exists.) Keeping systems single-scheme avoids inventing a second palette nobody asked for.

### Motion — `src/motion/`

Animation wrappers that compose around components and sections. Motion is never baked into base components — it is always applied by wrapping: `<Reveal><Card /></Reveal>`. The starter ships `Reveal`, `Stagger`, and `Hover`. Reach for [Motion](https://motion.dev)'s `useScroll` / `useTransform` / `whileInView` / `motion.div` primitives directly when you need:

- **Parallax** — `useScroll({ target: ref })` + `useTransform(scrollYProgress, [0, 1], ['0%', '-20%'])` on `motion.div`'s `y`.
- **Sticky / pinned scenes** — `position: sticky; top: 0` on a wrapper, with scroll-linked transforms on the children.
- **Scroll-linked scale / opacity** — same `useScroll` + `useTransform` pattern, applied to `scale` or `opacity`.
- **Counter / number rollups** — `useMotionValue` + `animate()` triggered by `whileInView`.
- **Staggered reveals** — `Stagger` for the simple case; raw `motion` variants when children need different choreography.

Add new wrappers under `src/motion/` (and re-export from `motion/index.ts`) when a scroll pattern is reused across sections. See `src/motion/AGENTS.md` for the wrapper conventions.

## Conventions

### UI primitives

- **Add via CLI**, edit in place. Don't hand-write a primitive that exists in the shadcn registry.
- **Variants via `cva`** — shadcn primitives use `class-variance-authority` to define variant maps. Follow that pattern when authoring new ones.
- **Use `cn()`** from `@/lib/utils` to merge Tailwind classes. Never concatenate class strings by hand.
- **Re-export from `components/index.ts`** if you want the single-import surface.

### Styling

- **Tailwind utilities first.** Theme tokens (`bg-primary`, `text-muted-foreground`, `rounded-lg`, `gap-4`) for everything that maps cleanly.
- **Theme tokens, not raw values.** `bg-primary` not `bg-[#5b5bd6]`. Edit `globals.css` to change the brand.
- **Arbitrary values are an escape hatch.** `text-[length:--type-display-size]` is fine when a token doesn't exist yet; if you reach for one twice, promote it to a token.
- **No CSS modules, no CSS-in-JS.** A single global `globals.css` plus Tailwind utilities is the whole styling story.

### Motion

- **Separation** — `src/components/` never imports from `src/motion/`. The two directories are independent.
- **Shared constants** — all wrappers import timing and easing values from `motion/constants.ts`.
- **Motion only** — wrappers import from `motion/react`, render `motion.div`, and accept `HTMLMotionProps<'div'>`.

### General

- **Spec is the source of truth** — if the design spec defines a section, primitive, or motion, it must exist in code. If the spec removes one, delete the file.
- **No unused abstractions** — don't create helpers, wrappers, or utilities beyond what the spec requires.
- **No emoji** in shipped UI.

## Build incrementally — logical batches at a time

Don't write everything at once and build at the end. Don't go file-by-file either — that's slow. Group things that **logically belong together** and ship them as one batch, then build:

- One section + the primitives it needs that aren't already there.
- A family of sections that share the same layout language (Hero + ImageText, both with the same heading scale and CTA component).
- A motion wrapper plus the sections that use it.

For each batch:

1. Create / modify the files for the batch.
2. Re-export from the relevant `index.ts`.
3. Export a `<Name>Demo` literal from each new section so the preview reflects the in-progress system.
4. Run `bun run build` to verify the batch type-checks and bundles. Read the output.
5. If the build fails, fix the errors before starting the next batch — don't pile broken work on top of broken work.

Before you exit the run, do a final pass on `README.md` and `src/sections/index.ts`: do the H1, the description, and the composition rationale match the system you just built? Are the `export * from` lines in `index.ts` in the order they should be rendered in the canonical page? If anything's stale, fix it. This is the last thing you should touch before finishing.

Builds during work are for your own verification — nothing host-side happens when you run `bun run build`. The host runs the build once, on its own, after you exit, and snapshots / publishes the preview based on that single run.

## Reference images (when present)

If the prompt includes a "## Reference images" manifest, the user attached visuals to the chat. They live under `refs/` in the workspace. Read them with the Read tool — they're context for tokens, type, mood, layout, motion. They are NOT assets to ship; if a reference should appear in the system as a real asset, copy it into `public/`.

## Constraints

- Do not commit. The host runs `git commit` once per turn, after you exit, against whatever final state you leave the workspace in.
- The post-exit build must pass. The host runs `bun run build` after you exit; if it fails the turn is reported as failed and nothing gets published. Use your own intermediate builds to make sure the final state is green.
- `README.md` and `src/sections/index.ts` must reflect the current system before you exit. The H1 name, the description, and the `## Composition` rationale match what you built; the order of `export * from` lines in `index.ts` is the order the canonical page should render. A stale README is a regression.
- This is a library — don't add a page shell, router, or `App`/render entry. Just author sections and keep them exported from `src/sections/index.ts`. Demo content is each section's `<Name>Demo` export.

## Commands

- `bun run build` — regenerate `design.json` (`gen:design`), type-check (`tsc --noEmit`), then bundle with Bun.build → `dist/library.js` + Tailwind CLI → `dist/theme.css`. There is no dev server; use `bun run build` to verify.
- `bun run ui:add <name>` — add a shadcn component (alias for `shadcn@latest add`).
