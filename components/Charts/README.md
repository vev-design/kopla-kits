# Charts

Copy `Charts.tsx` into `src/components/`, then add `export * from './Charts'`
to the component barrel. This one file exports `BarChart`, `PieChart`,
`LineChart`, `ScatterChart`, `BubbleChart`, their showcase cases and the shared brand types. No dependencies
or hydration are required. `Charts.demo.tsx` is only the lab's example look.
Use `skeleton.charts.tsx` as a section starting point.

## Configure a brand once

Save a JSON-serializable `ChartBrand` in the design system and bind it in a
shared chart module:

```tsx
import { createBrandedCharts, type ChartBrand } from '@/components/Charts';
import savedBrand from './chart-brand'; // A module exporting a typed ChartBrand.

export const { BarChart, PieChart, LineChart, ScatterChart, BubbleChart } = createBrandedCharts(
  savedBrand satisfies ChartBrand,
);
```

Callers import these bound components and supply data, meaning, and a surface
name. They do not select colors. A direct `brand` prop is also available when
rendering independent brands together. Binding uses a closure, not mutable
global state, so server renders and multiple brands remain isolated.

The type is the configuration contract, not a PDF extraction service. A host
interprets guidelines, loads approved font files, and saves a reviewed profile.
Unspecified geometry and typography fall back to kit defaults. Supplied
surfaces must be complete: a dark background must not inherit a light
background's text or semantic colors. An unknown surface or version throws;
a prohibited chart/surface combination displays the data table instead of
inventing another visual treatment.

| Rule | Configuration |
| --- | --- |
| Approved backgrounds and chart combinations | `defaultSurface`, `surfaces`, `allowedCharts` (pie and donut are separate) |
| Ordered category palette | `categorical` |
| Focus and supporting colors | `emphasis.focus`, `emphasis.context` |
| Positive, neutral, negative, other | `semantic` |
| Label contrast within marks | Each ink's `labelColor` |
| Persistent category/series identity | `seriesOrder`, surface-specific `series` assignments |
| Label, value, focal-statistic fonts | `typography` families, sizes, and weights |
| Bar corners, group spacing, separators, stack totals | `bar` |
| Line weight, points, dash patterns | `line` |
| Donut thickness, rotation, separators, label placement/content | `pie` |
| Scatter point radius, opacity, outline, labels and trend weight | `scatter` |
| Bubble radius ceiling, opacity, outline, ring count, labels and size legend | `bubble` |
| Approved trend-line color on each background | Surface `trend` |
| Focal statistic color on each background | Surface `focalText` |
| Grid, legend, value and endpoint labels | `defaults` |
| Optional entrance motion | `motion` |

## Meaning and color assignment

`colorMode="semantic"` uses each series/category's explicit `role`; absent
roles use `other`. The sign of a number is not its business meaning. A
highlight does not override semantic colors. In categorical mode, explicit
surface `series` assignments win, followed by `seriesOrder` palette positions.
In emphasis mode, highlighted IDs use the focus ink and other IDs use the
context palette at their registry positions.

Supply a persistent `seriesOrder` (including filtered-out IDs) or explicit
assignments to preserve colors across sorting/filtering and across charts.
Without a registry, source order determines categorical colors. Finite
palettes cycle; configure enough distinct approved inks for your categories.
The component does not manufacture brand shades or certify contrast. Validate
the saved palettes and inside-label colors during brand setup.

## Data, layout and motion

- Bar and line data is `{ id, label, values: { [seriesId]: number | null } }`.
  IDs must be nonempty and unique. Null/missing values are missing data;
  non-finite numbers are errors. Stacked bars accumulate positive and negative
  values separately. Bars always include zero.
- Lines use equally spaced ordered categories and straight segments. Include
  rows with null values for gaps in a time sequence. This is not a continuous
  datetime or scatterplot scale. A single observation remains a visible point.
- Pie data is `{ id, label, value, role? }`. Values must be finite and
  nonnegative. Zeros remain in the legend/table, but have no slice. An all-zero
  dataset displays an empty state. Percentages come from the complete total.
- Scatter data is `{ id, label, seriesId, x, y }`; bubble data also includes
  `size`. Declare series with their color IDs and semantic roles exactly as for
  bars/lines. X and Y are continuous numeric coordinates. Source order does
  not determine position. Null coordinates/sizes stay in the table and draw no
  mark; negative or non-finite sizes and non-finite coordinates are rejected.
- `xAxis` and `yAxis` independently configure labels, number formatting,
  suffixes, zero inclusion (default true), and optional fixed `domain: [min,max]`.
  A fixed domain must be finite, increasing, and cover every complete
  observation; charts never silently clip points outside a requested domain.
- Bubble **outer disk area** is proportional to size. There is no minimum
  radius, and zero draws no bubble. The largest complete observation sets the
  size scale unless `sizeMax` is supplied. Use the same `sizeMax`, brand
  `maxRadius`, axis domains, and rendered plot dimensions for comparisons
  across charts or filters. Small bubbles paint last to remain visible where
  observations overlap; points are never displaced to avoid overlap.
- Bubble `treatment="rings"` draws decorative concentric circles within the
  same area-scaled boundary. Ring count is styling, not another measurement.
  Brand `bubble.labels` and the chart's `labels` can select `inside` (size in
  display type), `outside` (observation names in a non-overlapping label rail),
  or `none`. Tiny inside labels are omitted in favor of the table. Optional
  `bubble.labelHaloWidth` separates ring-label text from lines; it defaults to
  zero. `sizeLabel`, `sizeNumberFormat`, and `sizeSuffix` format the third
  measurement independently. The size legend uses the same radius scale as
  the observations and can be disabled with `sizeLegend={false}`.
- Scatter `trendLine="linear"` draws one least-squares Y-on-X fit per series,
  clipped to the observed X range and plot domain. At least two complete
  observations with distinct X coordinates are required. This is a descriptive
  line, without confidence intervals, significance tests or extrapolation.
  The default is `none`. These components do not implement log axes, packed
  bubbles or freeform infographic positioning.
- Values use an explicit locale (`en-US` by default) and `numberFormat` options;
  `suffix` appends a literal unit. A percent formatter expects fractional data.
- Thin grids, labels, legends, titles and a semantic data table are shared.
  `dataTable="visible"` displays the table. Otherwise it remains available to
  screen readers. Plot labels may be shortened; native SVG titles, the legend
  and the table retain complete content. Small inside pie/stack labels defer
  to the table. Outside pie labels and line endpoints avoid collisions.
- SVGs retain readable coordinate sizes and scroll within a named, keyboard
  accessible region on narrow screens. Dense data and larger outside-label fonts increase the plot size;
  it never overflows the document. Containers and cards belong to the section.
- `animation="enter"` runs once on insertion: bars grow from zero, solid lines
  draw on, and pies/points/dashed lines fade in. Scatter markers and bubble
  groups (including rings and inside labels) fade in together; sizes and
  coordinates are always the final values. `animation="none"` overrides
  the brand's motion default. Durations are capped at two seconds. The final
  geometry is always in the HTML; reduced motion and print are fully static.
  Scroll-triggered playback and animated data updates are not implemented.

The demo's editorial colors and serif display text illustrate the configuration
capabilities. They are not official brand assets or measured brand guidelines.

## Verify

```sh
bun test tests/charts.unit.test.ts
node scripts/build-components.mjs
node demo/scripts/gen-components.mjs
pnpm exec playwright test tests/Charts.spec.ts
pnpm exec playwright test tests/catalog.spec.ts --grep Charts
```
