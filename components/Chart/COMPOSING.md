# Composing a brand's chart

`chart-composition.tsx` is the one file a brand's component build edits. It
holds two things: `chartTheme`, the values the renderer reads (colour roles,
type, grid, line weight, backgrounds), and `composeCircular`, which DRAWS a pie
or donut from the parts in `chart-primitives.tsx`. The renderer, the parts and
the source table are never edited; an upstream fix reaches every brand on its
next adoption.

A guide shows how a brand draws a share chart. Reproduce THAT, from these
parts, rather than describing it:

| Part | What it draws | The decisions it takes |
| --- | --- | --- |
| `slices(c, { ring, gap })` | the sectors | ring thickness (0 = pie, 0.62 = a donut), a separating stroke |
| `insideLabels(c, { text, ring, minShare, size, weight, color })` | a label in each sector | which text (`s.shareLabel`, `s.valueLabel`, `s.name`), weight, the smallest sector that gets one; returns `skipped` indexes |
| `outsideLabels(c, { lines, leaders, only, firstLine, size, weight, color, leaderColor })` | labels beside the circle | the lines per sector, `leaders: 'column' \| 'short' \| 'none'`, the first line's own weight, which sectors (`only`) |
| `donutCenter(c, { ring, size, weight })` | the authored focal figure in the hole | nothing to invent: it draws only what the author supplied |
| `key(c, { text })` | an HTML key under the circle | draw it only where the labels on the circle do not already say it |
| `canvas(c, parts)` | the SVG, sized to the tallest part | parts draw in order: slices first |

`c` (`CircularContext`) carries the sectors with `name`, `value`, `share`,
`color`, angles and formatted `shareLabel` / `valueLabel`, plus `donut` (what
the props asked for), `compact` (the phone layout; the function is called
twice), `outer`, `cx`, `cy`, the type and ink, and `center` when the author
supplied a focal figure.

Three idioms, to show the range:

```tsx
// Values inside the ring in bold, names outside on short thin leaders, no key.
export function composeCircular(c: CircularContext): CircularComposition {
  const ring = 0.58;
  const inside = insideLabels(c, { text: (s) => s.shareLabel, ring, weight: 700, minShare: 0.05 });
  return { canvas: canvas(c, [
    slices(c, { ring }),
    inside.node ? inside : inside,
    outsideLabels(c, { lines: (s) => [s.name], leaders: 'short' }),
    // A sector too narrow for its value gets it outside instead.
    outsideLabels(c, { lines: (s) => [s.shareLabel], leaders: 'none', only: inside.skipped }),
    donutCenter(c, { ring }),
  ]) };
}

// A pie with bold name and share stacked beside each sector, no leaders, no key.
export function composeCircular(c: CircularContext): CircularComposition {
  return { canvas: canvas(c, [
    slices(c, { gap: { color: chartTheme.backgrounds.default, width: 2 } }),
    outsideLabels(c, { lines: (s) => [s.name, s.shareLabel], leaders: 'none', firstLine: { weight: 700 } }),
  ]) };
}

// Plain sectors and a key: the circle carries no text at all.
export function composeCircular(c: CircularContext): CircularComposition {
  return { canvas: canvas(c, [slices(c)]), below: key(c, { text: (s) => s.shareLabel }) };
}
```

Rules that hold for every composition:

- **Every sector's name and share stay readable somewhere** — on the circle or
  in the key. The source table is rendered by `Chart.tsx` regardless and is not
  yours to remove.
- **Static.** No hooks, no browser APIs, no imports beyond `./chart-primitives`,
  `./Chart` types and React types. The function runs during server rendering.
- **Both layouts.** It is called with `compact: true` and `false`; a composition
  may differ between them (a key on the phone, labels on desktop) but must draw
  something in both.
- **Nothing invented.** `donutCenter` draws the author's figure or nothing; a
  composition never computes a total or a takeaway of its own.
- **Report what the parts cannot express** rather than approximating it: a
  treatment the guide shows that these parts cannot draw is a gap to name in
  the build's reply, and the reason a part gets added upstream.
