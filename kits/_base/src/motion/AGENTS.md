# Motion wrappers

Composable wrapper components that add animation behaviour to any child element, backed entirely by CSS scroll-driven animations in `motion.css` — no JavaScript animation library. Motion is always applied by wrapping — never baked into base components.

Because the wrappers are pure CSS, they carry **no hydration cost**: a section using them still publishes as static HTML. The animations are progressive enhancement — browsers without `animation-timeline` support, and users with reduced motion, see the content in its fully-visible resting state.

## Wrappers

| Wrapper      | Trigger        | Effect                                                        |
|--------------|----------------|---------------------------------------------------------------|
| `Reveal`     | Scroll enter   | Fades from `opacity: 0` + `translate: 0 16px` to rest, scrubbed by the element's own viewport entry |
| `Stagger`    | Scroll enter   | Same fade-rise, each child shifted a beat further into the scroll (60–80ms-equivalent default) |
| `Hover`      | Mouse hover    | Lifts `translate: 0 -2px`, scales down on press               |

## Conventions

- Every wrapper renders a plain `div` carrying a class from `motion.css` (`kit-reveal`, `kit-hover`) — pass any HTML prop, including Tailwind `className`.
- `Reveal` takes `delay` (seconds) to hold an element back behind a sibling; `Stagger` derives the same per-child delay from `step`.
- Durations, easings, keyframes, and animation ranges live in `motion.css`. Update them there when the spec's motion timing changes.
- Every animation's resting/fallback state is the fully-visible layout. Never author a state that needs JS or animation support to become visible.
- `animation-timeline: view()` reads the nearest ancestor **scroll container**, and `overflow: hidden` creates one that never scrolls — which freezes the animation on its opening (invisible) frame. Crop with `overflow-clip`, never `overflow-hidden`, anywhere a reveal can sit inside.

## Adding a new wrapper

1. Add the class + `@keyframes` to `motion.css`, inside the `@media (prefers-reduced-motion: no-preference)` / `@supports (animation-timeline: view())` guards.
2. Create `<Name>.tsx` in this folder rendering a plain `div` with the class; accept `ComponentPropsWithoutRef<'div'>` when the wrapper maps directly to a single element.
3. Re-export from `index.ts`.

Number rollups are the one motion pattern that genuinely needs JS — use `useCountUp()` from `@/lib/count-up` (not this folder) and tag the section `@hydrate`.
