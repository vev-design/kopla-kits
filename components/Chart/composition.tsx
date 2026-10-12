// THE BRAND'S CHART, in two parts: values the renderer reads (chartTheme) and
// the COMPOSITION of a circular chart from the parts in chart-primitives.tsx.
// This is the one file a brand's component build edits. The renderer, the
// primitives and the source table are never touched — see COMPOSING.md.
import type { ChartTheme } from './Chart';
import { canvas, donutCenter, insideLabels, key, outsideLabels, slices, type CircularContext } from './chart-primitives';
import type { ReactNode } from 'react';

/** Brand-settable values only. Keep the renderer unchanged when deriving a theme. */
export const chartTheme: ChartTheme = {
  /** Defaults follow the kit's chart tokens; semantic meanings do not imply red or green. */
  seriesRoles: {
    focus: 'var(--chart-1, var(--primary))', context: 'var(--muted-foreground)',
    positive: 'var(--chart-2, var(--primary))', negative: 'var(--chart-3, var(--foreground))', other: 'var(--muted-foreground)',
    categorical: ['var(--chart-1, var(--primary))', 'var(--chart-2, var(--muted-foreground))', 'var(--chart-3, var(--foreground))', 'var(--chart-4, var(--primary))', 'var(--chart-5, var(--muted-foreground))'],
  },
  /** Kit sans face; 20px heading, 12px labels, 11px notes, semibold heading. */
  typography: { fontFamily: 'var(--font-sans, sans-serif)', titleSize: 20, labelSize: 12, noteSize: 11, titleWeight: 600 },
  /** 1px token grid; set width to zero when the brand prohibits a grid. */
  grid: { color: 'var(--border)', width: 1 },
  /** 2px data/axis strokes; take the approved weight from chart rules. */
  line: { width: 2 },
  /** Default and muted kit surfaces. Both use textColor below. */
  backgrounds: { default: 'var(--background)', muted: 'var(--muted)' },
  /** Default foreground ink. Choose ink readable on both approved surfaces. */
  textColor: 'var(--foreground)',
  /** No extra prohibitions by default. Retain structural restrictions here for authors. */
  neverDo: [],
  /** No frame device by default. A named component is passed through Chart.frame. */
  frameDevice: null,
};

export interface CircularComposition {
  /** The SVG — compose it with `canvas(c, [...parts])`. */
  canvas: ReactNode;
  /** Anything under the circle (a key); omit when the labels already say it. */
  below?: ReactNode;
}

/**
 * How this brand draws a pie or donut. The neutral default: sectors, every
 * name and share beside the circle on an elbow leader, no key (the labels
 * already carry name and share; the source table carries the values).
 *
 * Called twice per chart — once compact (phone), once wide — with the same
 * data; `c.compact` says which. Keep it static: no hooks, no browser APIs.
 */
export function composeCircular(c: CircularContext): CircularComposition {
  const ring = c.donut ? 0.62 : 0;
  return {
    canvas: canvas(c, [
      slices(c, { ring }),
      outsideLabels(c, { lines: (s) => [s.name, s.shareLabel], leaders: 'column' }),
      donutCenter(c, { ring }),
    ]),
    // Ten sectors and up: the circle cannot carry every name legibly, so the
    // key repeats them with values. Fewer: the labels are the key.
    below: c.slices.length >= 10 ? key(c) : undefined,
  };
}

// The pieces are deliberately exported here too, so a composition can be
// tested on its own and a brand's file can grow helpers beside it.
export { insideLabels };
