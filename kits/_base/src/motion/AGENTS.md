# Motion wrappers

Composable wrapper components powered by [Motion](https://motion.dev) (npm `motion`, imports from `motion/react`) that add animation behaviour to any child element. Motion is always applied by wrapping — never baked into base components.

## Wrappers

| Wrapper      | Trigger        | Effect                                                  |
|--------------|----------------|---------------------------------------------------------|
| `Reveal`     | Scroll enter   | Fades from `opacity: 0` + `y: 16` to rest (0.56s, ease-default) |
| `Stagger`    | Scroll enter   | Orchestrates children with `staggerChildren` (60ms default) |
| `Hover`      | Mouse hover    | Lifts `y: -2` with spring physics, scales on tap        |

## Conventions

- Every wrapper renders a `motion.div`.
- `Reveal` and `Hover` accept `HTMLMotionProps<'div'>` — pass any Motion or HTML prop, including Tailwind `className`.
- Shared duration / easing values live in `constants.ts`. Update them when the spec's motion timing changes.
- All scroll-triggered wrappers use `viewport={{ once: true }}` — they animate in once and stay.

## Adding a new wrapper

1. Create `<Name>.tsx` in this folder. Import `motion` and `HTMLMotionProps` from `motion/react`.
2. Accept `HTMLMotionProps<'div'>` when the wrapper maps directly to a single motion element.
3. Reuse values from `constants.ts` for durations and easings.
4. Re-export from `index.ts`.
