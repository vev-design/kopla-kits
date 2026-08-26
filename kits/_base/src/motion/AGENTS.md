# Motion wrappers

Composable wrapper components that add animation behaviour to any child element, backed by CSS in `motion.css` — no JavaScript animation library. Motion is always applied by wrapping — never baked into base components.

The wrappers carry **no hydration cost**: a section using them still publishes as static HTML. The reveal is a TIME-PLAYED entrance triggered on viewport entry — `animation-trigger` natively where the browser has it (Chrome 151+), and a tiny IntersectionObserver the page build injects everywhere else (it feature-detects, so it's a no-op where the native path runs). That script belongs to the HOST's page build, not to this folder — from a section author's point of view the wrappers are still just CSS classes. Users with reduced motion, and any surface without the trigger or the script, see the content in its fully-visible resting state.

## Wrappers

| Wrapper      | Trigger        | Effect                                                        |
|--------------|----------------|---------------------------------------------------------------|
| `Reveal`     | Viewport entry | Plays a 0.6s fade from `opacity: 0` + `translate: 0 16px` to rest, once, when the element enters the viewport |
| `Stagger`    | Viewport entry | Same fade, each child's `animation-delay` a beat later (80ms default) — a visible left-to-right / top-to-bottom wave |
| `Hover`      | Mouse hover    | Lifts `translate: 0 -2px`, scales down on press               |

## Conventions

- Every wrapper renders a plain `div` carrying a class from `motion.css` (`kit-reveal`, `kit-hover`) — pass any HTML prop, including Tailwind `className`.
- `Reveal` takes `delay` (seconds) to hold an element back behind a sibling; `Stagger` derives the same per-child delay from `step`.
- Durations, easings and keyframes live in `motion.css`. Update them there when the spec's motion timing changes.
- Every animation's resting/fallback state is the fully-visible layout. Never author a state that needs JS or animation support to become visible — nothing in `motion.css` hides content on its own, and `.kit-hidden` / `.kit-in` are applied only by the host's reveal script, never authored.
- The class names `kit-reveal`, `kit-hidden` and `kit-in` are a KEEP-IN-SYNC contract with the host's injected reveal script (kopla's `build-runner/reveal-enhance.mjs`). Rename them in both places or not at all.

## Adding a new wrapper

1. Add the class + `@keyframes` to `motion.css`, inside the `@media (prefers-reduced-motion: no-preference)` guard — and if it should trigger on viewport entry, wire it through the same native-`@supports` / `.kit-in` pair the reveal uses.
2. Create `<Name>.tsx` in this folder rendering a plain `div` with the class; accept `ComponentPropsWithoutRef<'div'>` when the wrapper maps directly to a single element.
3. Re-export from `index.ts`.

Scroll-SCRUBBED motion (parallax, progress-tracked effects) still uses `animation-timeline: view()` directly — see the deck and annual-report kits' globals for the pattern. Mind its gotcha: `view()` reads the nearest ancestor **scroll container**, and `overflow: hidden` creates one that never scrolls, freezing the animation on its first frame. Crop with `overflow-clip`, never `overflow-hidden`, anywhere scrubbed motion can sit inside. (The reveal wrappers no longer have this constraint — a triggered animation doesn't read scroll containers the same way.)

Number rollups are the one motion pattern that genuinely needs JS — use `useCountUp()` from `@/lib/count-up` (not this folder) and tag the section `@hydrate`.
