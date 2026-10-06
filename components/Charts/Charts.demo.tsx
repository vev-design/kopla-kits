// The lab supplies example looks. These illustrative colors are not an official
// brand specification; consumers save their own approved colors and load fonts.
import { BarChart, PieChart, LineChart, type ChartBrand, type ChartInk, type ChartSurface,
  type BarChartProps, type PieChartProps, type LineChartProps } from './Charts';

const ink = (color: string, labelColor = '#ffffff'): ChartInk => ({ color, labelColor });
const categorical = [ink('#cc0033'), ink('#8b7de0'), ink('#d9d4ff', '#221632'), ink('#56515c'), ink('#470c37')];
const light: ChartSurface = {
  background: '#ffffff', text: '#221632', focalText: '#cc0033', mutedText: '#625b68', axis: '#c5bec9', grid: '#e7e2e9',
  categorical,
  emphasis: { focus: ink('#cc0033'), context: [ink('#d9d4ff', '#221632'), ink('#8b7de0'), ink('#88828c')] },
  semantic: { positive: ink('#cc0033'), neutral: ink('#d9d4ff', '#221632'), negative: ink('#470c37'), other: ink('#e7e2dc', '#221632') },
};
export const editorialChartBrand: ChartBrand = {
  version: 1, defaultSurface: 'paper', seriesOrder: ['revenue', 'cost', 'profit', 'other'],
  surfaces: {
    paper: light,
    warm: { ...light, background: '#f3f0eb' },
    violet: { ...light, background: '#d9d4ff', focalText: '#470c37', allowedCharts: ['pie', 'donut'] },
    dark: {
      ...light, background: '#470c37', text: '#ffffff', focalText: '#ffffff', mutedText: '#e6cfe3', axis: '#9a718e', grid: '#704362',
      categorical: [ink('#ff2854', '#22071b'), ink('#d9d4ff', '#221632'), ink('#a998ec', '#221632')],
      emphasis: { focus: ink('#ff2854', '#22071b'), context: [ink('#d9d4ff', '#221632'), ink('#a998ec', '#221632')] },
      semantic: { positive: ink('#ff2854', '#22071b'), neutral: ink('#d9d4ff', '#221632'), negative: ink('#a998ec', '#221632'), other: ink('#e7e2dc', '#221632') },
    },
  },
  typography: { displayFamily: 'Georgia, serif', displaySize: 36, labelSize: 12, valueSize: 13 },
  bar: { radius: 0, groupGap: 0.22, totals: true },
  line: { width: 1.5, pointRadius: 0 },
  pie: { innerRadius: 0.6, separatorWidth: 0, labels: 'inside' },
  defaults: { grid: false, legend: true, values: false, lineLabels: 'end' },
  motion: { enabled: false, durationMs: 900 },
};
const roundedChartBrand: ChartBrand = {
  version: 1,
  bar: { radius: 9, groupGap: 0.4 },
  line: { width: 3, pointRadius: 4, dashPatterns: ['', '5 3', '2 3'] },
  pie: { innerRadius: 0.72, separatorWidth: 4 },
  defaults: { grid: true, values: false, lineLabels: 'end' },
};
type DemoProps = ({ kind: 'bar' } & BarChartProps | { kind: 'pie' } & PieChartProps | { kind: 'line' } & LineChartProps)
  & { treatment?: 'kit' | 'editorial' | 'rounded' };

export function Charts(props: DemoProps) {
  const brand = props.treatment === 'editorial' ? editorialChartBrand : props.treatment === 'rounded' ? roundedChartBrand : props.brand;
  return <div className="p-6" style={{ minWidth: 0 }}>
    {props.kind === 'bar' ? <BarChart {...props} brand={brand} />
      : props.kind === 'pie' ? <PieChart {...props} brand={brand} /> : <LineChart {...props} brand={brand} />}
  </div>;
}

export const ChartsShowcase = [
  { label: "Grouped bars", props: {
    kind: "bar",
    title: "Revenue by quarter",
    series: [
      {id: "revenue", label: "Revenue"},
      {id: "cost", label: "Cost"},
      {id: "profit", label: "Profit"},
    ],
    data: [
      {id: "q1", label: "Q1", values: {revenue: 24, cost: 18, profit: 6}},
      {id: "q2", label: "Q2", values: {revenue: 32, cost: 20, profit: 12}},
      {id: "q3", label: "Q3", values: {revenue: 28, cost: 18, profit: 10}},
      {id: "q4", label: "Q4", values: {revenue: 40, cost: 25, profit: 15}},
    ],
    animation: "enter",
  } },
  { label: "Editorial stacked bars", props: {
    kind: "bar",
    title: "Revenue mix",
    treatment: "editorial",
    series: [
      {id: "revenue", label: "Revenue"},
      {id: "cost", label: "Cost"},
      {id: "profit", label: "Profit"},
    ],
    data: [
      {id: "q1", label: "Q1", values: {revenue: 24, cost: 18, profit: 6}},
      {id: "q2", label: "Q2", values: {revenue: 32, cost: 20, profit: 12}},
      {id: "q3", label: "Q3", values: {revenue: 28, cost: 18, profit: 10}},
      {id: "q4", label: "Q4", values: {revenue: 40, cost: 25, profit: 15}},
    ],
    layout: "stacked",
  } },
  { label: "Rounded bars", props: {
    kind: "bar",
    title: "Revenue by quarter",
    treatment: "rounded",
    series: [
      {id: "revenue", label: "Revenue"},
      {id: "cost", label: "Cost"},
      {id: "profit", label: "Profit"},
    ],
    data: [
      {id: "q1", label: "Q1", values: {revenue: 24, cost: 18, profit: 6}},
      {id: "q2", label: "Q2", values: {revenue: 32, cost: 20, profit: 12}},
      {id: "q3", label: "Q3", values: {revenue: 28, cost: 18, profit: 10}},
      {id: "q4", label: "Q4", values: {revenue: 40, cost: 25, profit: 15}},
    ],
  } },
  { label: "Horizontal negative stacks", props: {
    kind: "bar",
    title: "Contributions to change",
    orientation: "horizontal",
    layout: "stacked",
    values: true,
    series: [
      {id: "revenue", label: "Revenue"},
      {id: "cost", label: "Cost"},
      {id: "profit", label: "Profit"},
    ],
    data: [
      {id: "a", label: "North", values: {revenue: 12, cost: -8, profit: -4}},
      {id: "b", label: "South", values: {revenue: -6, cost: 10, profit: 8}},
    ],
  } },
  { label: "Vertical negative groups", props: {
    kind: "bar",
    title: "Contributions to change",
    values: true,
    series: [
      {id: "revenue", label: "Revenue"},
      {id: "cost", label: "Cost"},
      {id: "profit", label: "Profit"},
    ],
    data: [
      {id: "a", label: "North", values: {revenue: 12, cost: -8, profit: -4}},
      {id: "b", label: "South", values: {revenue: -6, cost: 10, profit: 8}},
    ],
  } },
  { label: "Highlight on dark", props: {
    kind: "bar",
    title: "Focus on revenue",
    treatment: "editorial",
    surface: "dark",
    series: [
      {id: "revenue", label: "Revenue"},
      {id: "cost", label: "Cost"},
      {id: "profit", label: "Profit"},
    ],
    data: [
      {id: "q1", label: "Q1", values: {revenue: 24, cost: 18, profit: 6}},
      {id: "q2", label: "Q2", values: {revenue: 32, cost: 20, profit: 12}},
      {id: "q3", label: "Q3", values: {revenue: 28, cost: 18, profit: 10}},
      {id: "q4", label: "Q4", values: {revenue: 40, cost: 25, profit: 15}},
    ],
    highlight: [
      "revenue",
    ],
  } },
  { label: "Forbidden background", props: {
    kind: "bar",
    title: "A background that only allows circular charts",
    treatment: "editorial",
    surface: "violet",
    series: [
      {id: "revenue", label: "Revenue"},
      {id: "cost", label: "Cost"},
      {id: "profit", label: "Profit"},
    ],
    data: [
      {id: "q1", label: "Q1", values: {revenue: 24, cost: 18, profit: 6}},
      {id: "q2", label: "Q2", values: {revenue: 32, cost: 20, profit: 12}},
      {id: "q3", label: "Q3", values: {revenue: 28, cost: 18, profit: 10}},
      {id: "q4", label: "Q4", values: {revenue: 40, cost: 25, profit: 15}},
    ],
  } },
  { label: "Semantic pie", props: {
    kind: "pie",
    title: "Responses",
    treatment: "editorial",
    colorMode: "semantic",
    data: [
      {id: "agree", label: "Agree", role: "positive", value: 78},
      {id: "neutral", label: "Neutral", role: "neutral", value: 14},
      {id: "disagree", label: "Disagree", role: "negative", value: 8},
    ],
    animation: "enter",
  } },
  { label: "Donut on dark", props: {
    kind: "pie",
    title: "Responses",
    treatment: "editorial",
    surface: "dark",
    colorMode: "semantic",
    variant: "donut",
    data: [
      {id: "agree", label: "Agree", role: "positive", value: 78},
      {id: "neutral", label: "Neutral", role: "neutral", value: 14},
      {id: "disagree", label: "Disagree", role: "negative", value: 8},
    ],
    centerValue: "78%",
    centerLabel: "Agree",
  } },
  { label: "Donut on violet", props: {
    kind: "pie",
    title: "Responses",
    treatment: "editorial",
    surface: "violet",
    colorMode: "semantic",
    variant: "donut",
    data: [
      {id: "agree", label: "Agree", role: "positive", value: 78},
      {id: "neutral", label: "Neutral", role: "neutral", value: 14},
      {id: "disagree", label: "Disagree", role: "negative", value: 8},
    ],
    centerValue: "78%",
    centerLabel: "Agree",
  } },
  { label: "Outside labels", props: {
    kind: "pie",
    title: "Response breakdown",
    data: [
      {id: "agree", label: "Agree", role: "positive", value: 78},
      {id: "neutral", label: "Neutral", role: "neutral", value: 14},
      {id: "disagree", label: "Disagree", role: "negative", value: 8},
    ],
    labels: "outside",
  } },
  { label: "Full circle", props: {
    kind: "pie",
    title: "Complete",
    variant: "donut",
    centerValue: "100%",
    data: [
      {id: "done", label: "Complete", value: 100},
      {id: "zero", label: "Remaining", value: 0},
    ],
  } },
  { label: "Large outside labels", props: {
    kind: "pie", title: "Regional share", labels: "outside",
    brand: { version: 1, typography: { labelSize: 24, labelFamily: "Arial, sans-serif" } },
    data: [
      { id: "north", label: "North America", value: 50 },
      { id: "south", label: "South America", value: 50 },
    ],
  } },
  { label: "Maximum size outside labels", props: {
    kind: "pie", title: "Regional share", labels: "outside", locale: "de-DE",
    brand: { version: 1, typography: { labelSize: 72, labelFamily: "Georgia, serif", labelWeight: 700 } },
    data: [
      { id: "wide", label: "WWWWWWWWWWWWW", value: 99 },
      { id: "long", label: "A deliberately long regional label", value: 1 },
    ],
  } },
  { label: "Ten categories and long label", props: {
    kind: "pie",
    title: "Distribution",
    labels: "outside",
    data: [
      {id: "0", label: "An intentionally long category label that must remain available in the legend and data table", value: 50},
      {id: "1", label: "Category 2", value: 20},
      {id: "2", label: "Category 3", value: 10},
      {id: "3", label: "Category 4", value: 5},
      {id: "4", label: "Category 5", value: 4},
      {id: "5", label: "Category 6", value: 3},
      {id: "6", label: "Category 7", value: 3},
      {id: "7", label: "Category 8", value: 2},
      {id: "8", label: "Category 9", value: 2},
      {id: "9", label: "Category 10", value: 1},
    ],
  } },
  { label: "Editorial line", props: {
    kind: "line",
    title: "Quarterly trend",
    treatment: "editorial",
    surface: "warm",
    series: [
      {id: "revenue", label: "Revenue"},
      {id: "cost", label: "Cost"},
      {id: "profit", label: "Profit"},
    ],
    data: [
      {id: "q1", label: "Q1", values: {revenue: 24, cost: 18, profit: 6}},
      {id: "q2", label: "Q2", values: {revenue: 32, cost: 20, profit: 12}},
      {id: "q3", label: "Q3", values: {revenue: 28, cost: 18, profit: 10}},
      {id: "q4", label: "Q4", values: {revenue: 40, cost: 25, profit: 15}},
    ],
    animation: "enter",
  } },
  { label: "Rounded line", props: {
    kind: "line",
    title: "Quarterly trend",
    treatment: "rounded",
    series: [
      {id: "revenue", label: "Revenue"},
      {id: "cost", label: "Cost"},
      {id: "profit", label: "Profit"},
    ],
    data: [
      {id: "q1", label: "Q1", values: {revenue: 24, cost: 18, profit: 6}},
      {id: "q2", label: "Q2", values: {revenue: 32, cost: 20, profit: 12}},
      {id: "q3", label: "Q3", values: {revenue: 28, cost: 18, profit: 10}},
      {id: "q4", label: "Q4", values: {revenue: 40, cost: 25, profit: 15}},
    ],
  } },
  { label: "Missing observations", props: {
    kind: "line",
    title: "Gaps remain gaps",
    series: [
      {id: "revenue", label: "Revenue"},
    ],
    data: [
      {id: "0", label: "Q1", values: {revenue: 12}},
      {id: "1", label: "Q2", values: {revenue: 20}},
      {id: "2", label: "Q3", values: {revenue: null}},
      {id: "3", label: "Q4", values: {revenue: 28}},
      {id: "4", label: "Q5", values: {revenue: null}},
      {id: "5", label: "Q6", values: {revenue: 18}},
      {id: "6", label: "Q7", values: {revenue: 25}},
    ],
  } },
  { label: "Single observation", props: {
    kind: "line",
    title: "One observation",
    series: [
      {id: "revenue", label: "Revenue"},
    ],
    data: [
      {id: "q1", label: "Q1", values: {revenue: 24, cost: 18, profit: 6}},
    ],
    labels: "none",
    legend: false,
  } },
  { label: "Empty pie", props: {
    kind: "pie",
    title: "No responses yet",
    data: [
      {id: "a", label: "Agree", value: 0},
      {id: "b", label: "Disagree", value: 0},
    ],
  } },
  { label: "Empty bars", props: {
    kind: "bar",
    title: "Awaiting results",
    series: [
      {id: "revenue", label: "Revenue"},
      {id: "cost", label: "Cost"},
      {id: "profit", label: "Profit"},
    ],
    data: [
    ],
  } },
  { label: "Missing line data", props: {
    kind: "line",
    title: "Awaiting observations",
    series: [
      {id: "revenue", label: "Revenue"},
      {id: "cost", label: "Cost"},
      {id: "profit", label: "Profit"},
    ],
    data: [
      {id: "q1", label: "Q1", values: {revenue: null, cost: null, profit: null}},
    ],
  } },
  { label: "Ten bar categories", props: {
    kind: "bar",
    title: "Monthly performance",
    orientation: "horizontal",
    series: [
      {id: "revenue", label: "Revenue"},
    ],
    data: [
      {id: "0", label: "An intentionally long regional category label", values: {revenue: 18}},
      {id: "1", label: "Month 2", values: {revenue: 20}},
      {id: "2", label: "Month 3", values: {revenue: 25}},
      {id: "3", label: "Month 4", values: {revenue: 22}},
      {id: "4", label: "Month 5", values: {revenue: 24}},
      {id: "5", label: "Month 6", values: {revenue: 20}},
      {id: "6", label: "Month 7", values: {revenue: 18}},
      {id: "7", label: "Month 8", values: {revenue: 30}},
      {id: "8", label: "Month 9", values: {revenue: 29}},
      {id: "9", label: "Month 10", values: {revenue: 35}},
    ],
    dataTable: "visible",
  } },
  { label: "Pie without labels", props: {
    kind: "pie",
    title: "Two segments",
    labels: "none",
    legend: true,
    data: [
      {id: "agree", label: "Agree", role: "positive", value: 78},
      {id: "neutral", label: "Neutral", role: "neutral", value: 14},
    ],
  } },
  { label: "Line without zero", props: {
    kind: "line",
    title: "Small changes around a large baseline",
    series: [
      {id: "revenue", label: "Revenue"},
    ],
    includeZero: false,
    data: [
      {id: "0", label: "Q1", values: {revenue: 100}},
      {id: "1", label: "Q2", values: {revenue: 100.2}},
      {id: "2", label: "Q3", values: {revenue: 100.1}},
      {id: "3", label: "Q4", values: {revenue: 100.3}},
    ],
  } },
];
