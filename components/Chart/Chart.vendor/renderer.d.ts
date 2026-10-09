/** Public subset used by Chart; implementation is the pinned vendored renderer. */
export declare function init(element: null, theme: undefined, options: { renderer: 'svg'; ssr: true; width: number; height: number }): {
  setOption(option: Record<string, unknown>): void;
  renderToSVGString(): string;
  dispose(): void;
};
