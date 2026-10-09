import type { ChartTheme } from './Chart';

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
