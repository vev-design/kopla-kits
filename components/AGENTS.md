# Using a catalog component

This directory is the **advanced-components catalog**: prebuilt,
token-themed components — proven implementations of behavior that is easy
to get wrong. They are **copy-in** components, shadcn-style: the source is
copied into a workspace and forks from there; the catalog is not an npm
dependency.

It spans two tiers, and `component.json.hydrate` is which one:

- **`hydrate: false` — the platform tier.** Interactivity the browser
  already does: `Accordion` on `<details name>`, `Drawer` and `Dialog` on
  the popover API, `Carousel` on CSS scroll-snap, `Marquee` on a CSS
  animation. These publish with **zero JavaScript** and keep the keyboard
  and screen-reader behavior for free. **Reach here first** — a section
  built from these stays static, so there is no hydration flag to get
  wrong and nothing to ship.
- **`hydrate: true` — the JS tier.** Behavior the platform genuinely
  can't express: `Scrollytelling`, `CountUp`. Worth the bundle when the
  request needs them; not worth it for a disclosure list.

A tier-two component makes every page using it ship the design system's
hydration bundle, so prefer tier one whenever it delivers the behavior
that was actually asked for.

Each component is a folder:

```
components/<Name>/
  component.json   # catalog metadata: description, whenToUse, tags,
                   # hydrate, vendor (never copied into a workspace)
  <Name>.tsx       # the component — the file you copy
  <Name>.vendor/   # (optional) pinned third-party code the component
                   # ships with; copied alongside the component
```

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
  react, `motion/react`, `@/lib/utils`, `@/motion`, `@/components/*` —
  everything a workspace already has. No new npm dependencies: a
  third-party lib rides in `vendor/` as a pinned, pre-bundled ESM file,
  recorded in `component.json.vendor`
  (`{ pkg, version, license }` per entry).
- **Token-themed**: style with token-backed utilities (`bg-muted`,
  `text-primary`, `border`, `rounded-*`) so the component re-skins with
  every system.
- **Static by default**; a component needing client JS carries the
  `@hydrate` JSDoc tag on its Props interface AND `"hydrate": true` in
  `component.json`. Prefer server-real content (render final values on
  the server, animate on hydration).
- JSDoc'd `*Props`, explicit string-union variant axes, and a
  `<Name>Showcase` of static object literals — exactly like a kit
  component, so the copied file needs no rework to appear in
  `design.json`.
- CI: `node scripts/build-components.mjs` assembles the blank kit plus
  every catalog component and runs the real workspace build.
