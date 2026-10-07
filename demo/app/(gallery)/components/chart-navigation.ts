// Derive navigation from the same showcase props the iframe renders. Indices
// remain the original registry indices, so filtering never opens another case.
export const chartTypes = [
  { id: 'bar', label: 'Bars' }, { id: 'line', label: 'Lines' },
  { id: 'pie', label: 'Pie' }, { id: 'donut', label: 'Donut' },
  { id: 'scatter', label: 'Scatter' }, { id: 'bubble', label: 'Bubble' },
] as const;
export type ChartType = typeof chartTypes[number]['id'];
interface Case { label: string; props: Record<string, unknown> }

export function chartNavigation(cases: Case[]) {
  return cases.map(({ label, props }, index) => {
    const type = (props.kind === 'pie' && props.variant === 'donut' ? 'donut' : props.kind) as ChartType;
    const data = (props.data ?? []) as Record<string, unknown>[];
    const edge = !data.length || props.preset === 'large-type' || props.sizing === 'scroll'
      || (props.surface === 'accent' && type !== 'pie' && type !== 'donut')
      || ((type === 'line' || type === 'scatter' || type === 'bubble') && data.length === 1)
      || (type === 'bar' && data.length >= 10)
      || data.some((row) => Object.values((row.values ?? row) as Record<string, unknown>).some((value) => value === null));
    let treatment: string;
    if (edge) treatment = 'Data & edge cases';
    else if (type === 'bar') treatment = props.orientation === 'horizontal' ? 'Horizontal' : props.layout === 'stacked' ? 'Stacked' : 'Grouped';
    else if (type === 'line') treatment = props.labels === 'none' ? 'Legend' : 'End labels';
    else if (type === 'pie' || type === 'donut') {
      const brandPie = (props.brand as { pie?: Record<string, unknown> } | undefined)?.pie;
      const labels = props.labels ?? brandPie?.labels ?? 'inside';
      const categoryLabels = props.categoryLabels ?? (props.labels !== undefined ? labels : brandPie?.categoryLabels ?? labels);
      const valueLabels = props.valueLabels ?? (props.labels !== undefined ? labels : brandPie?.valueLabels ?? labels);
      treatment = data.some((row) => row.annotation) ? 'Callouts'
        : categoryLabels === 'outside' || valueLabels === 'outside' ? 'Outside labels'
        : categoryLabels === 'none' && valueLabels === 'none' ? 'Legend only'
        : 'Inside labels';
      if (data.every((row) => row.value === 0)) treatment = 'Data & edge cases';
    } else if (type === 'scatter') treatment = props.trendLine === 'linear' ? 'Trend line' : props.labels === 'outside' ? 'Direct labels' : 'Points';
    else treatment = props.treatment === 'rings' ? 'Rings' : 'Filled';
    return { index, label, type, treatment };
  });
}
