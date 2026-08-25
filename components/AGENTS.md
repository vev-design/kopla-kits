# Using a catalog component

This directory is the **advanced-components catalog**: prebuilt,
token-themed components (scroll-driven storytelling, animated counters,
marquees, …) — proven implementations of behavior that is easy to get
wrong. They are **copy-in** components, shadcn-style: the source is
copied into a workspace and forks from there; the catalog is not an npm
dependency.

Each component is a folder:

```
components/<Name>/
  component.json   # catalog metadata: description, whenToUse, tags,
                   # hydrate, implements, vendor (never copied into a
                   # workspace)
  <Name>.tsx       # the component — the file you copy
  <Name>.vendor/   # (optional) pinned third-party code the component
                   # ships with; copied alongside the component
```

## `implements`: which behaviour a component is the recipe for

A design import negotiates BEHAVIOUR with the user — *is that row of cards a
carousel?* — and each answer is a token in a closed vocabulary. `implements`
is how a component says which of those answers it IS, so a consumer can
generate a "copy this instead of writing it" table from what a kits ref
actually staged rather than from a paragraph of prose in a prompt.

```json
"implements": [
  { "token": "carousel-arrows", "props": { "controls": "both" } },
  { "token": "carousel-auto",   "props": { "controls": "dots" },
    "note": "Set autoAdvanceMs from the design's own AFTER_TIMEOUT. Never invent an interval." }
]
```

Three rules, and the second is the one that is easy to get wrong:

- **One entry per ANSWER, not per component.** A component that covers two
  behaviours a user would genuinely choose between declares two tokens —
  `Carousel` is the recipe for both a reader-driven gallery and a
  self-advancing one. One token covering both means the question can't reach
  one of them.
- **Carry the props that MAKE it that behaviour.** A row that says only
  `carousel-auto → Carousel` leaves the agent picking the controls, which is
  the same guess moved one prop over. The props are half the recipe.
- **But if the two answers disagree about `hydrate`, they are two
  components.** The scroll-pinned pile once shared a file with a
  pointer-driven deck, and the deck's `useState` made the pure-CSS pile
  ship a runtime it never ran — hydration is inferred per FILE, so the
  cheaper answer pays for the expensive one. (The deck itself was later
  dropped as never actually asked for; the rule outlived it.)
- **`note` is for the part that cannot be a literal.** `carousel-auto` needs an
  interval that comes from the design's own prototype timing, so there is no
  value to put in `props` — what belongs in the table is "take it from the
  design, never invent one".

A bare string (`"implements": ["marquee"]`) stays legal and means the
component's defaults already are that behaviour. Omit the field entirely for a
component that isn't a recipe for any of them.

## To use one in a workspace

1. **Pick by `whenToUse`.** Read the `component.json` files (or the
   staged `catalog.json`); `whenToUse` says what each component is for
   AND what it is not for.
2. **Copy everything except `component.json`** into `src/components/`,
   keeping the relative layout. Today's components are a single
   `<Name>.tsx`; a vendored component also ships a `<Name>.vendor/`
   folder whose relative imports already resolve after the copy — so
   the copy is always verbatim, never edited.
3. **Register it**: add `export * from './<Name>';` to
   `src/components/index.ts` (the catalog barrel — export order is
   catalog order). The extractor then surfaces it into
   `design.json.components` on the next build; no manifest editing
   needed.
4. **Use it from sections** like any other catalog component. Adapt at
   the call site (props, copy, wrapper layout). Edit the copied file
   only when the request genuinely needs different behavior.

## Authoring rules (adding a component to this catalog)

Same contract as a kit's component catalog (CONTRACT.md "Components"),
plus the catalog-specific rules:

- **Single-file** (`<Name>.tsx`) unless vendoring; imports limited to
  react, `lucide-react`, `@/lib/utils`, `@/lib/count-up`, `@/motion`,
  `@/components/*` — everything a workspace already has, because they are
  `_base` dependencies. NOT `motion/react`: the motion library left the
  substrate when entrance animation went CSS scroll-driven (see
  `_base/src/motion/motion.css`); animate with those classes, or
  `@/lib/count-up` for a counted figure. No new npm dependencies: a
  third-party lib rides in `vendor/` as a pinned, pre-bundled ESM file,
  recorded in `component.json.vendor` (`{ pkg, version, license }` per
  entry).
- **Token-themed**: style with token-backed utilities (`bg-muted`,
  `text-primary`, `border`, `rounded-*`) so the component re-skins with
  every system.
- **Comment the non-obvious decisions at their point of use.** These files
  are copied into a workspace and forked from there, `component.json` is
  not copied, and the next edit is made by something with no memory of
  why the code looks like this. "The inset is a `margin`, not a
  `transform` — a scaled card still occupies its unscaled height" is the
  only thing standing between a fork and a reintroduced bug. Prefer "this
  shipped as a bug once" over "this is best practice".
- **Static by default**; a component needing client JS carries the
  `@hydrate` JSDoc tag on its Props interface AND `"hydrate": true` in
  `component.json`. Prefer server-real content (render final values on
  the server, animate on hydration).
- **`hydrate: false` means no hooks.** Not "few" — none. A static
  component renders as a Server Component in a consumer's workspace, so
  one `useState` either throws where nobody is looking or forces the file
  client and makes every section using it ship a runtime. Both look
  perfect in the component lab, which renders inside a client boundary.
  Where a static component needs a unique id, derive it from its own
  content rather than reaching for `useId` — see `Accordion`.
- **`hydrate: false` also means no `lucide-react`.** Every lucide icon
  renders through its `Icon`, which is `'use client'` and reads a
  context, so importing one ships a runtime for a chevron. Nothing about
  the component looks wrong — it has no hooks and no `'use client'` of
  its own, so a hydration check says static and it is not. Inline the SVG;
  `Modal` has the shape to copy. Lucide is fine in a component that
  already declares `@hydrate`.
- JSDoc'd `*Props`, explicit **string-union** variant axes, and a
  `<Name>Showcase` of static object literals — exactly like a kit
  component, so the copied file needs no rework to appear in
  `design.json`. String-union matters literally: the extractor turns enum
  props into the variant matrix, and `perView?: 1 | 2 | 3` is silently
  *not* one. The prop keeps working and stops being discoverable.
- CI: `node scripts/build-components.mjs` checks every manifest, refuses
  a `hydrate: false` component that calls a hook, then assembles TWO kit
  workspaces (`blank` plus one with a catalog of its own) with every
  catalog component copied in, runs the real build, and asserts each
  component surfaced in `design.json` with the hydration the extractor
  inferred from the AST matching what the manifest claims. Two kits
  because each kit SHADOWS `src/components/index.ts`: a component that
  collides with a kit's own primitive builds fine in `blank` and fails
  the moment a customer picks a different system.

## The interactive contract

Anything a reader can operate has to hold everything below. These are not
aspirations — each is an assertion in `tests/`, most of them run against every
showcase case at every width, and a new component inherits them by existing.
`pnpm test:components` runs the lot.

### Reach for the platform first, then write the result down

`kits/_base/AGENTS.md` tells a section to reach for the platform before React
state. That advice is right and kept being followed *differently*: a `<div>`
with a click handler here, a `<details>` missing the shared `name` there,
`aria-expanded` bolted onto a `<summary>` that already reports its own state.
The behaviour was free; getting it right was not.

So `Accordion`, `Tabs` and `Modal` exist — as components, and as
**zero-JavaScript** ones. That is not a contradiction of the advice, it is the
advice with the answer written down once instead of re-derived every run. When
a design asks for one of these, copy it; don't rebuild it in React state.

The bar for joining them is the catalog's own: *behaviour that is easy to get
wrong*. Exclusive disclosure, a switched panel and a top-layer dialog each have
something to get wrong — a missing `name`, a claimed tablist, a portal. A
two-state content swap does not: it is a checkbox and a `:has()` rule, and
wrapping it cost more in API (a checkbox naming two options is awkward, and
three options do not fit at all) than it saved. Reach for the platform there
too, and write the section directly.

Reach for client JS only when the platform genuinely cannot express the
behaviour — a quiz's score, a carousel's timer, a deck's drag. Then say so
with `@hydrate`, and hold the rest of this contract.

### Every word survives with JavaScript off

A published page ships as HTML with no JavaScript unless a section declares
`@hydrate`. So the unhydrated render is a real state a reader will see: on
first paint before hydration, and permanently when a section forgot the tag.
The rule is exact, because it is tested by comparing the page with scripts on
against the same page with scripts off:

**Nothing the hydrated render shows may be missing from the unhydrated one.**

Two consequences worth knowing before you write the component rather than
after:

- **Gate controls on hydration, never content.** Render every panel, slide or
  card from the server and let hydration *collapse* the set — `hidden` on the
  inactive ones, `inert` on a nav whose handlers have not arrived. A control
  that looks live and swallows the press is worse than one that is honestly
  not there yet.
- **Label a hydration-gated control with `aria-label`, never `sr-only` text.**
  `sr-only` text is real text: it lands in the comparison, and a Pause button
  that only exists once hydrated makes "no content disappears" start failing
  on the *labels of controls* instead of on content.

Where degrading costs something, say so in the component's header comment
rather than leaving it to be discovered. `StepFlow` collapses a full outline to
one panel at hydration, which is a layout shift on first paint; the note says
that, and says why keeping the content was worth it.

### 360 / 768 / 1440, no document overflow, 44px targets

Tested at all three widths on every case. 360 is where things break, and the
failures are ones a className cannot tell you about: a rotated card counts its
corners toward the document's scroll width, so a tilted stack gives the whole
*page* a few pixels of horizontal scroll — invisible until someone swipes
sideways on a phone. A `<fieldset>` ignores its flex parent's shrink unless you
set `min-inline-size: 0`, and a long option label then pushes the document
sideways.

Every control's smaller side is at least 44px, measured on the element that
actually receives the tap: for a label-wrapped input that is the label, not the
16px box inside it. A dot in a carousel is 8px of drawing inside 44px of
button.

### Pointer, touch and keyboard, on real elements

Real `<button>`, `<a>`, `<input>`, `<summary>` — then the keyboard, focus ring
and accessibility tree are the platform's and cannot rot. Where a gesture is
genuinely needed, use **Pointer Events** for one code path across mouse, pen
and touch, and know that `setPointerCapture` retargets the following `click`
to the capturing element: an `onClick` for the tap plus pointer handlers for
the drag is broken in a way only a browser shows you. Decide tap-versus-drag
on release from the distance travelled.

Document the key map in the component's header comment, including when the
answer is "the platform's, and nothing is rebound".

### Name the ARIA pattern, or don't claim one

State in the header which pattern the component implements — `aria-current`
for a step in a sequence, a group with `aria-roledescription="carousel"` and
named slides, a single tab stop with arrow keys for a deck. And do not claim a
pattern you cannot honour: `Tabs` is a strip of *links* to sections, so it
carries no `role="tablist"`, because a tablist promises arrow-key movement
between tabs that anchors do not give you.

Don't add ARIA the element already implies. `<summary>` is a disclosure button
that reports its own expanded state; a hand-written `aria-expanded` has to be
kept truthful, and keeping it truthful means tracking `open` in state.

Announce a state change **once**, and only when the reader caused it. A visible
counter can be its own live region — better than a drawn counter plus an
sr-only twin. A carousel that announces its own timer talks over the rest of
the page every few seconds.

### `prefers-reduced-motion` is required

Honour it through `motion-safe:` variants so it is right by default and cannot
be forgotten at a call site. Where motion is driven from JS, read `matchMedia`
live — someone can turn the setting on while the page is open.

Content that moves on its own is a stronger case: it does not run at all under
reduced motion, and when it does run it ships a real pause control (WCAG 2.2.2
— moving content lasting more than five seconds needs a way to stop it) and
pauses under the pointer and while anything inside it has focus.

### Content-agnostic, and the showcase is what proves it

A component in this catalog will be handed content it was never designed
around. So every `<Name>Showcase` carries the adversarial cases, and carrying
them is what makes them tested:

- **2 items and 10 items** — a layout tuned for three.
- **A deliberately overlong label** that has to wrap.
- **A missing image**, on one entry of several, without the row collapsing.
- **No body copy**, title only.
- **Every variant axis** at least once.

Write showcase data **longhand**. `Array.from({ length: 10 }, …)` reads better
and is wrong: the extractor reads static literals only, so a generated case is
dropped from `design.json` while still rendering in the component lab — a case
that looks tested and is absent from the product.

Case labels are the stable name for a case; `?case=` is positional. In a spec,
look a case up by label, never by number, or inserting a case above it silently
re-points the test at a different configuration.

### The lab is the other half of the harness

`pnpm dev` → `http://localhost:3000/components`. It renders each component in a
real iframe at a real width, with the showcase's own cases, **scripts off**,
reduced motion, and all thirteen kit themes. Judge the no-JS render on the
default theme (`blank`) — the others are fetched on demand, so switching theme
needs JS by construction, and the lab says so rather than hiding it.

Reskinning is the one check the test suite cannot make: a hardcoded radius or
colour compiles perfectly and only shows up under someone else's tokens. Flip
through the themes.
