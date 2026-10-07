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
| Donut thickness, rotation, separators, independent category/value labels, pie legend visibility | `pie` |
| Scatter point radius, opacity, outline, labels and trend weight | `scatter` |
| Bubble radius ceiling, opacity, outline, ring count, labels and size legend | `bubble` |
| Approved trend-line color on each background | Surface `trend` |
| Focal statistic color on each background | Surface `focalText` |
| Grid, legend visibility/placement, value and endpoint labels | `defaults` |
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
- The default `sizing="responsive"` fits ordinary charts to their container.
  CSS container queries select one of three server-rendered layouts. Horizontal
  positions expand with the plot; text, strokes and circle radii stay in CSS
  pixels. A narrow card on a desktop receives the narrow layout too. Only one
  SVG is visible and exposed to assistive technology; caption, legend and data
  table are shared. This requires no measurement hooks or hydration.
- Numeric axes use locale-aware compact notation (for example `€1.7M`). Tables
  retain unabbreviated values with the requested number formatting and complete
  category/series names. Category ticks are thinned as space decreases. Margins
  budget for configured font sizes; line endpoints and outside pie/observation
  labels move below the plot on narrow layouts. Labels may be shortened with
  their full text preserved in SVG titles and the table.
- Dense plots deliberately scroll in a named, keyboard-accessible region:
  more than 12 bar categories or 40 line observations reserve minimum spacing.
  `sizing="scroll"` explicitly requests a wide plot. Unusually large typography,
  long numeric units or containers below 280px may also require scrolling.
  The document itself stays within its container. Verify the final font assets:
  static rendering uses conservative character budgets, not live glyph metrics.
- Bubble radii are capped to fit each responsive layout. Use matching container
  sizes/layouts as well as `sizeMax` for visual size comparisons across charts.
  Small or overlapping inside labels are omitted instead of reduced below 12px
  or painted over one another; their full values remain in the table.
  Very long donut center strings are shortened at a minimum 12px; the full
  strings remain in their native SVG titles.
- `animation="enter"` runs once on insertion: bars grow from zero, solid lines
  draw on, and pies/points/dashed lines fade in. Scatter markers and bubble
  groups (including rings and inside labels) fade in together; sizes and
  coordinates are always the final values. `animation="none"` overrides
  the brand's motion default. Durations are capped at two seconds. The final
  geometry is always in the HTML; reduced motion and print are fully static.
  Scroll-triggered playback and animated data updates are not implemented.

The demo's editorial colors and serif display text illustrate the configuration
capabilities. They are not official brand assets or measured brand guidelines.

## Brand label treatments

A legend is the series/color key. All charts default to `legendPosition="right"`,
with the legend beside the plot. Cartesian charts use subtle gridlines by default.
Category labels sit close to the baseline; wrapped labels and negative
value labels reserve extra space only when needed.
Brand settings still override these defaults (`defaults.grid`, `defaults.legendPosition`).

Cartesian titles, subtitles and vertical-axis numbers share a left edge.
Use `description` for a subtitle with the reporting period and units. Scatter
and bubble axis names read horizontally; long horizontal-axis names wrap.
Line endpoint labels show the series name and latest available value, moving
below the plot on small containers. They replace the separate legend by default.
Single-series scatter and bubble charts also omit the redundant color key.
Explicit `legend` and `brand.defaults.legend` settings still take precedence.
Bubble reference circles retain the plot's area scale and share one row whenever
their diameters and labels fit, including on phones.

Use `legendPosition="top"` for a key above the plot or `legendPosition="bottom"`
for a key below it. `legendPosition="right"` (or
`brand.defaults.legendPosition`) places it beside the plot when the container
is at least 600px wide; it wraps below on smaller containers. `legend={false}`
suppresses it. Set `brand.pie.legend` to control only pie/donut legends.

Pie and donut charts also default to a right-side legend, moving below on narrow
containers. Their titles are centered above the plot itself, excluding the side
legend from the title's alignment area.

Category names and numeric pie labels can be selected independently. For a
brand treatment with outside names, inside percentages and no repeated key:

```tsx
const brand: ChartBrand = {
  version: 1,
  defaults: { legendPosition: 'right' },
  pie: {
    categoryLabels: 'outside',
    valueLabels: 'inside',
    valueContent: 'percent',
    legend: false,
  },
};
```

For names and percentages inside a pie, set both placements to `inside`.
For a key-only treatment, set both to `none` and enable the legend. These
settings also exist as chart props. Legacy `labels` / `insideLabel` settings
remain supported; explicit per-channel props take priority, followed by an
explicit legacy `labels` prop, then brand settings. Inside labels that cannot
fit their slice defer to the accessible table.

Simple bars can place values inside using `bar.valueLabels: 'inside'` or the
`valueLabels` prop. Values use each ink's approved `labelColor`. Crowded labels
are omitted, while every value remains in the table. Brand-specific typefaces,
colors and weights are preserved; responsive layout does not replace them.

## Verify

```sh
bun test tests/charts.unit.test.ts
node scripts/build-components.mjs
```

Use `pnpm dev` to review the chart gallery at 360, 768, and 1440px, switch brands,
and check the scripts-off and reduced-motion controls.

## Practical pie examples

The lab includes customer agreement and sentiment, household spending, project
funding, an annotated investment plan, fundraising progress, budget allocation,
product revenue, training completion, device traffic, and customer segments.
Figures are illustrative and labelled as sample data.

All gallery examples inherit the active kit's chart colors and font families,
including dark and accent surfaces. Examples with more than five categories
derive additional tints from the kit's palette.

The label treatments demonstrate:

- Consistent outside names and inside percentages for both pies and donuts:
  `categoryLabels="outside"`, `valueLabels="inside"`, and
  `outsideLabelLayout="radial"` place names beside their slices with leader lines.
- `highlight={["positive"]}` to emphasize an inside percentage using the brand's
  display typography while keeping semantic colors unchanged.
- A donut's `centerValue` and `centerLabel`, with a right-side legend and
  `brand.defaults.legendMarker="circle"`.
- An optional `annotation` on each pie datum for explanatory callouts. Callouts
  wrap beside the plot at wide sizes and move below on narrow screens; their
  complete text also appears in the accessible data table.

A datum's optional `labelAngle` positions its outside label's anchor in degrees
within that slice. It never changes the slice geometry or inside-value position;
anchors outside the slice are rejected. Small inside values defer to the table
when there is not enough room to render them legibly.
