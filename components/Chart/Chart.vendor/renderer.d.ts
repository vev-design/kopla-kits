/** Public subset used by Chart; implementation is the pinned vendored renderer. */
export declare function init(element: null, theme: undefined, options: { renderer: 'svg'; ssr: true; width: number; height: number }): {
  setOption(option: Record<string, unknown>): void;
  renderToSVGString(): string;
  dispose(): void;
};

/** Uncompressed static SVG; avoids collapsed near-full arcs at small radii. */
export declare function renderStaticSVG(chart: ReturnType<typeof init>): string;

/** Conservative, deterministic layout widths; never reads the DOM or loads fonts. */
export declare function measureStaticText(text: string, font?: string): { width: number };
