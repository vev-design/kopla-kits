// Example treatments inherit the active kit's colors and fonts.
import { BarChart, PieChart, LineChart, ScatterChart, BubbleChart, type ChartBrand, type ChartInk, type ChartSurface,
  type BarChartProps, type PieChartProps, type LineChartProps, type ScatterChartProps, type BubbleChartProps } from './Charts';

// All example colors are theme tokens. The examples vary chart geometry and
// labels, while the selected kit supplies the palette and font families.
// A theme can provide chart-specific text ink; otherwise choose light or dark
// ink from each slice's lightness, rather than reusing the primary's text color.
const contrastInk = (color: string) => `oklch(from ${color} clamp(0, (0.6 - l) * 1000, 1) 0 0)`;
const ink = (color: string, labelColor = contrastInk(color)): ChartInk => ({ color, labelColor });
const colors = [1, 2, 3, 4, 5].map((index) => {
  // A kit without chart tokens still needs distinguishable slices.
  const color = `var(--chart-${index}, color-mix(in oklab, var(--primary) ${100 - (index - 1) * 12}%, var(--background)))`;
  return ink(color, `var(--chart-${index}-foreground, ${contrastInk(color)})`);
});
// Kits expose five colors; derive extra tints for the nine-category example.
const categorical = [...colors, ...colors.slice(0, 4).map((item) => ink(
  `color-mix(in oklab, ${item.color} 65%, var(--background))`,
))];
const light: ChartSurface = {
  background: 'var(--background)', text: 'var(--foreground)', focalText: 'var(--chart-1, var(--primary))',
  mutedText: 'var(--muted-foreground)', axis: 'var(--border)', grid: 'var(--border)', trend: colors[1]!.color,
  categorical,
  emphasis: { focus: colors[0]!, context: categorical.slice(1) },
  semantic: { positive: colors[0]!, neutral: colors[1]!, negative: colors[2]!, other: colors[3]! },
};
export const editorialChartBrand: ChartBrand = {
  version: 1, defaultSurface: 'paper', seriesOrder: ['revenue', 'cost', 'profit', 'other'],
  surfaces: {
    paper: light,
    warm: { ...light, background: 'var(--muted)' },
    accent: { ...light, background: 'var(--accent)', text: 'var(--accent-foreground)', allowedCharts: ['pie', 'donut'] },
    dark: { ...light, background: 'var(--foreground)', text: 'var(--background)', focalText: 'var(--background)',
      mutedText: 'var(--background)', axis: 'color-mix(in oklab, var(--background) 30%, var(--foreground))',
      grid: 'color-mix(in oklab, var(--background) 12%, var(--foreground))' },
  },
  typography: { displaySize: 36, labelSize: 12, valueSize: 13 },
  bar: { radius: 0, groupGap: 0.22, totals: true },
  line: { width: 1.5, pointRadius: 0 },
  pie: { innerRadius: 0.6, separatorWidth: 0, labels: 'inside' },
  defaults: { grid: true, values: false, lineLabels: 'end' },
  scatter: { radius: 3.5, trendWidth: 1 },
  bubble: { maxRadius: 48, fillOpacity: 1, strokeWidth: 0.75, ringCount: 9 },
  motion: { enabled: false, durationMs: 900 },
};
const surveyChartBrand: ChartBrand = {
  ...editorialChartBrand,
  typography: { labelSize: 14, valueSize: 16, valueWeight: 700, displaySize: 40, displayWeight: 700 },
};
const reportChartBrand: ChartBrand = {
  ...editorialChartBrand, seriesOrder: [],
  typography: { labelSize: 13, valueSize: 14, displaySize: 26 },
  pie: { innerRadius: 0.62, separatorWidth: 2, labels: 'inside' },
  defaults: { ...editorialChartBrand.defaults, legendMarker: 'circle' },
};
const roundedChartBrand: ChartBrand = {
  version: 1,
  bar: { radius: 9, groupGap: 0.4 },
  line: { width: 3, pointRadius: 4, dashPatterns: ['', '5 3', '2 3'] },
  pie: { innerRadius: 0.72, separatorWidth: 4 },
  defaults: { grid: true, values: false, lineLabels: 'end' },
};
type DemoProps = ({ kind: 'bar' } & BarChartProps | { kind: 'pie' } & PieChartProps | { kind: 'line' } & LineChartProps | { kind: 'scatter' } & ScatterChartProps | { kind: 'bubble' } & BubbleChartProps)
  & { preset?: 'kit' | 'editorial' | 'rounded' | 'large-type' };

export function Charts(props: DemoProps) {
  const brand = props.preset === 'large-type' ? { ...editorialChartBrand, typography: { labelSize: 19, labelWeight: 700, valueSize: 19, displaySize: 48 } } satisfies ChartBrand : props.preset === 'editorial' ? editorialChartBrand : props.preset === 'rounded' ? roundedChartBrand : props.brand;
  return <div className="p-6" style={{ minWidth: 0 }}>
    {props.kind === 'bar' ? <BarChart {...props} brand={brand} />
      : props.kind === 'pie' ? <PieChart {...props} brand={brand} />
      : props.kind === 'line' ? <LineChart {...props} brand={brand} />
      : props.kind === 'scatter' ? <ScatterChart {...props} brand={brand} /> : <BubbleChart {...props} brand={brand} />}
  </div>;
}

// Scenario figures are illustrative sample data, not reported results.
export const ChartsShowcase = [
  { label: "Grouped bars", props: {
    kind: "bar",
    title: "Revenue by quarter",
    description: "In million dollars",
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
    preset: "editorial",
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
    preset: "rounded",
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
    preset: "editorial",
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
    preset: "editorial",
    surface: "accent",
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
    description: "Share of total responses",
    preset: "editorial",
    colorMode: "semantic",
    data: [
      {id: "agree", label: "Agree", role: "positive", value: 78},
      {id: "neutral", label: "Neutral", role: "neutral", value: 14},
      {id: "disagree", label: "Disagree", role: "negative", value: 8},
    ],
    animation: "enter",
  } },
  { label: 'Survey agreement — outside names', props: {
    kind: 'pie', variant: 'donut', title: 'Would you recommend our service?',
    description: '100 customer responses · Sample data', colorMode: 'semantic',
    brand: { ...surveyChartBrand, pie: { innerRadius: 0.52, startAngle: -230.4, categoryLabels: 'outside', valueLabels: 'inside', legend: false } },
    outsideLabelLayout: 'radial', height: 420,
    data: [
      { id: 'agree', label: 'Agree', role: 'positive', value: 78, labelAngle: -180 },
      { id: 'neutral', label: 'Neutral', role: 'neutral', value: 14 },
      { id: 'disagree', label: 'Disagree', role: 'negative', value: 8 },
    ],
  } },
  { label: 'Survey sentiment — emphasized majority', props: {
    kind: 'pie', title: 'Customer sentiment', description: '1,000 survey responses · Sample data',
    colorMode: 'semantic', highlight: ['positive'], height: 360,
    brand: { ...surveyChartBrand, pie: { startAngle: -140.4, categoryLabels: 'inside', valueLabels: 'inside', legend: false } },
    data: [
      { id: 'positive', label: 'Positive', role: 'positive', value: 780 },
      { id: 'negative', label: 'Negative', role: 'negative', value: 220 },
    ],
  } },
  { label: 'Household spending — outside names', props: {
    kind: 'pie', title: 'Where the household budget goes', description: '$5,000 monthly spending · Sample data',
    brand: reportChartBrand, categoryLabels: 'outside', valueLabels: 'inside', legend: false,
    outsideLabelLayout: 'radial', height: 420,
    numberFormat: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
    data: [
      { id: 'housing', label: 'Housing', value: 1500 },
      { id: 'food', label: 'Food', value: 1250 },
      { id: 'transport', label: 'Transport', value: 1000 },
      { id: 'savings', label: 'Savings', value: 750 },
      { id: 'other', label: 'Other', value: 500 },
    ],
  } },
  { label: 'Project funding — detailed legend', props: {
    kind: 'pie', variant: 'donut', title: 'How the project is funded',
    description: '$10 million community center · Sample data', brand: reportChartBrand,
    labels: 'none', centerValue: '$10M', centerLabel: 'Total funding',
    numberFormat: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
    data: [
      { id: 'city', label: 'City funding', value: 2000000 },
      { id: 'regional', label: 'Regional grant', value: 1500000 },
      { id: 'national', label: 'National grant', value: 1500000 },
      { id: 'foundation', label: 'Foundation', value: 1500000 },
      { id: 'businesses', label: 'Local businesses', value: 1000000 },
      { id: 'individuals', label: 'Individual donors', value: 1000000 },
      { id: 'events', label: 'Fundraising events', value: 500000 },
      { id: 'reserves', label: 'Reserves', value: 500000 },
      { id: 'other', label: 'Other grants', value: 500000 },
    ],
  } },
  { label: 'Investment priorities — annotated donut', props: {
    kind: 'pie', variant: 'donut', title: 'Investing in better public services',
    description: '2026 capital investment plan · Sample data', brand: reportChartBrand,
    categoryLabels: 'none', valueLabels: 'inside', legend: false, height: 400,
    centerValue: '2026', centerLabel: 'Capital plan',
    data: [
      { id: 'housing', label: 'Housing', value: 30, annotation: 'Build 120 affordable homes near public transport.' },
      { id: 'schools', label: 'Schools', value: 25, annotation: 'Renovate classrooms in six primary schools.' },
      { id: 'transport', label: 'Transport', value: 20, annotation: 'Add safe cycle routes and step-free bus stops.' },
      { id: 'parks', label: 'Parks', value: 15 },
      { id: 'digital', label: 'Digital services', value: 10 },
    ],
  } },
  { label: 'Fundraising goal', props: {
    kind: 'pie', variant: 'donut', preset: 'editorial', surface: 'dark',
    title: 'Community library fund', description: '$780,000 raised toward a $1 million goal · Sample data',
    colorMode: 'semantic', labels: 'none', centerValue: '78%', centerLabel: 'of goal raised',
    numberFormat: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
    data: [
      { id: 'raised', label: 'Raised', role: 'positive', value: 780000 },
      { id: 'remaining', label: 'Still needed', role: 'neutral', value: 220000 },
    ],
  } },
  { label: 'Annual budget allocation', props: {
    kind: 'pie', variant: 'donut', preset: 'editorial', surface: 'accent',
    title: 'Where the budget goes', description: 'Annual operating budget · Sample data',
    centerValue: '$1M', centerLabel: 'Total budget',
    numberFormat: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
    data: [
      { id: 'people', label: 'People', value: 540000 },
      { id: 'technology', label: 'Technology', value: 240000 },
      { id: 'operations', label: 'Operations', value: 150000 },
      { id: 'marketing', label: 'Marketing', value: 70000 },
    ],
  } },
  { label: 'Revenue by product', props: {
    kind: 'pie', preset: 'editorial', title: 'Revenue by product',
    description: '$1 million in annual revenue · Sample data', categoryLabels: 'outside', valueLabels: 'inside', legend: false,
    outsideLabelLayout: 'radial',
    numberFormat: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
    data: [
      { id: 'platform', label: 'Platform', value: 480000 },
      { id: 'services', label: 'Services', value: 300000 },
      { id: 'support', label: 'Support', value: 150000 },
      { id: 'training', label: 'Training', value: 70000 },
    ],
  } },
  { label: 'Training completion', props: {
    kind: 'pie', variant: 'donut', preset: 'editorial',
    title: 'Security training complete', description: 'All 240 employees completed this year’s course · Sample data',
    centerValue: '100%', centerLabel: 'Completed', labels: 'none', colorMode: 'semantic',
    data: [
      { id: 'done', label: 'Completed', role: 'positive', value: 240 },
      { id: 'remaining', label: 'Remaining', role: 'neutral', value: 0 },
    ],
  } },
  { label: "Editorial line", props: {
    kind: "line",
    title: "Revenue, costs and profit",
    description: "2025 quarterly results · In million dollars",
    preset: "editorial",
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
    title: "Revenue, costs and profit",
    description: "2025 quarterly results · In million dollars",
    labels: "none",
    preset: "rounded",
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
    title: "Monthly revenue",
    description: "January–July 2025 · In million dollars. March and May are not yet reported.",
    series: [
      {id: "revenue", label: "Revenue"},
    ],
    data: [
      {id: "0", label: "Jan", values: {revenue: 12}},
      {id: "1", label: "Feb", values: {revenue: 20}},
      {id: "2", label: "Mar", values: {revenue: null}},
      {id: "3", label: "Apr", values: {revenue: 28}},
      {id: "4", label: "May", values: {revenue: null}},
      {id: "5", label: "Jun", values: {revenue: 18}},
      {id: "6", label: "Jul", values: {revenue: 25}},
    ],
  } },
  { label: "Single observation", props: {
    kind: "line",
    title: "First-quarter revenue",
    description: "2025 · In million dollars. Later quarters are not yet reported.",
    series: [
      {id: "revenue", label: "Revenue"},
    ],
    data: [
      {id: "q1", label: "Q1", values: {revenue: 24, cost: 18, profit: 6}},
    ],
    labels: "none",
    legend: false,
  } },
  { label: 'New survey awaiting responses', props: {
    kind: 'pie', preset: 'editorial', title: 'How was your onboarding?',
    description: 'The survey has just opened. Results appear after the first response.',
    colorMode: 'semantic',
    data: [
      { id: 'helpful', label: 'Helpful', role: 'positive', value: 0 },
      { id: 'neutral', label: 'Neutral', role: 'neutral', value: 0 },
      { id: 'unhelpful', label: 'Unhelpful', role: 'negative', value: 0 },
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
    title: "Quarterly financial results",
    description: "In million dollars · Results appear once the first quarter closes.",
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
  { label: 'Website traffic by device', props: {
    kind: 'pie', preset: 'editorial', title: 'How visitors browse',
    description: '10,000 website sessions in September · Sample data',
    data: [
      { id: 'mobile', label: 'Mobile', value: 6200 },
      { id: 'desktop', label: 'Desktop', value: 3100 },
      { id: 'tablet', label: 'Tablet', value: 700 },
    ],
  } },
  { label: "Line without zero", props: {
    kind: "line",
    title: "Consumer price index",
    description: "2025 · Index, Q1 = 100. The vertical scale starts at 100.",
    series: [
      {id: "revenue", label: "Price index"},
    ],
    includeZero: false,
    data: [
      {id: "0", label: "Q1", values: {revenue: 100}},
      {id: "1", label: "Q2", values: {revenue: 100.2}},
      {id: "2", label: "Q3", values: {revenue: 100.1}},
      {id: "3", label: "Q4", values: {revenue: 100.3}},
    ],
  } },
  { label: "Scatter with trend", props: {
    kind: "scatter",
    title: "Project investment and return",
    description: "Ten completed projects · 2025. The line shows the overall trend.",
    preset: "editorial",
    animation: "enter",
    trendLine: "linear",
    series: [
      {id: "projects", label: "Projects"},
    ],
    data: [
      {id: "p1", label: "Project 1", seriesId: "projects", x: 10, y: 12},
      {id: "p2", label: "Project 2", seriesId: "projects", x: 16, y: 25},
      {id: "p3", label: "Project 3", seriesId: "projects", x: 22, y: 18},
      {id: "p4", label: "Project 4", seriesId: "projects", x: 29, y: 34},
      {id: "p5", label: "Project 5", seriesId: "projects", x: 38, y: 28},
      {id: "p6", label: "Project 6", seriesId: "projects", x: 44, y: 43},
      {id: "p7", label: "Project 7", seriesId: "projects", x: 53, y: 47},
      {id: "p8", label: "Project 8", seriesId: "projects", x: 65, y: 51},
      {id: "p9", label: "Project 9", seriesId: "projects", x: 78, y: 69},
      {id: "p10", label: "Project 10", seriesId: "projects", x: 90, y: 64},
    ],
    xAxis: {label: "Investment ($m)", suffix: "m"},
    yAxis: {label: "Annual return (%)", suffix: "%"},
  } },
  { label: "Scatter direct labels", props: {
    kind: "scatter",
    title: "Demand and margin by market",
    description: "Year-over-year change · 2025",
    preset: "rounded",
    labels: "outside",
    series: [
      {id: "a", label: "Established"},
      {id: "b", label: "Emerging"},
    ],
    data: [
      {id: "norway", label: "Norway", seriesId: "a", x: -8, y: -2},
      {id: "brazil", label: "Brazil", seriesId: "b", x: -3, y: 1},
      {id: "germany", label: "Germany", seriesId: "a", x: 3, y: 3},
      {id: "india", label: "India", seriesId: "b", x: 10, y: 8},
      {id: "canada", label: "Canada", seriesId: "a", x: 15, y: 5},
    ],
    xAxis: {label: "Demand growth (%)", suffix: "%"},
    yAxis: {label: "Margin change (pp)", suffix: " pp"},
  } },
  { label: "Scatter single observation", props: {
    kind: "scatter",
    title: "First completed project",
    description: "Pilot investment and annual return · 2025",
    labels: "none",
    series: [
      {id: "projects", label: "Projects"},
    ],
    data: [
      {id: "p1", label: "Warehouse upgrade", seriesId: "projects", x: 10, y: 12},
    ],
    xAxis: {label: "Investment ($m)", includeZero: false},
    yAxis: {label: "Annual return (%)", suffix: "%", includeZero: false},
    trendLine: "linear",
  } },
  { label: "Scatter missing observations", props: {
    kind: "scatter",
    title: "Project reporting progress",
    description: "Investment and annual return · Incomplete reports remain in the table.",
    xAxis: {label: "Investment ($m)"},
    yAxis: {label: "Annual return (%)", suffix: "%"},
    series: [
      {id: "projects", label: "Projects"},
    ],
    data: [
      {id: "p1", label: "Project 1", seriesId: "projects", x: 10, y: 12},
      {id: "p2", label: "Missing X", seriesId: "projects", x: null, y: 20},
      {id: "p3", label: "Missing Y", seriesId: "projects", x: 30, y: null},
    ],
    dataTable: "visible",
  } },
  { label: "Scatter empty", props: {
    kind: "scatter",
    title: "New project portfolio",
    description: "Investment and annual return will appear after the first project reports.",
    xAxis: {label: "Investment ($m)"},
    yAxis: {label: "Annual return (%)", suffix: "%"},
    series: [
      {id: "projects", label: "Projects"},
    ],
    data: [
    ],
  } },
  { label: "Scatter forbidden background", props: {
    kind: "scatter",
    title: "Restricted chart treatment",
    preset: "editorial",
    surface: "accent",
    series: [
      {id: "projects", label: "Projects"},
    ],
    data: [
      {id: "p1", label: "Project 1", seriesId: "projects", x: 10, y: 12},
      {id: "p2", label: "Project 2", seriesId: "projects", x: 16, y: 25},
    ],
  } },
  { label: "Bubble area comparison", props: {
    kind: "bubble",
    title: "Market growth and profitability",
    description: "2025 · Circle area represents annual revenue in million dollars.",
    preset: "editorial",
    animation: "enter",
    colorMode: "semantic",
    series: [
      {id: "core", label: "Core markets", role: "positive"},
      {id: "growth", label: "Growth markets", role: "neutral"},
    ],
    data: [
      {id: "a", label: "North", seriesId: "core", x: 12, y: 18, size: 25},
      {id: "b", label: "South", seriesId: "core", x: 30, y: 40, size: 100},
      {id: "c", label: "East", seriesId: "growth", x: 62, y: 28, size: 64},
      {id: "d", label: "West", seriesId: "growth", x: 80, y: 56, size: 36},
    ],
    xAxis: {label: "Revenue growth (%)", suffix: "%"},
    yAxis: {label: "Operating margin (%)", suffix: "%"},
    sizeLabel: "Revenue ($m)",
    sizeSuffix: "m",
    sizeMax: 100,
  } },
  { label: "Bubble concentric rings", props: {
    kind: "bubble",
    title: "Market opportunities",
    description: "2025 · Circle area represents annual revenue in million dollars.",
    preset: "editorial",
    surface: "dark",
    animation: "enter",
    treatment: "rings",
    labels: "outside",
    series: [
      {id: "core", label: "Core markets", role: "positive"},
      {id: "growth", label: "Growth markets", role: "neutral"},
    ],
    data: [
      {id: "a", label: "North", seriesId: "core", x: 12, y: 18, size: 25},
      {id: "b", label: "South", seriesId: "core", x: 30, y: 40, size: 100},
      {id: "c", label: "East", seriesId: "growth", x: 62, y: 28, size: 64},
      {id: "d", label: "West", seriesId: "growth", x: 80, y: 56, size: 36},
    ],
    xAxis: {label: "Revenue growth (%)", suffix: "%"},
    yAxis: {label: "Operating margin (%)", suffix: "%"},
    sizeLabel: "Revenue ($m)",
    sizeSuffix: "m",
  } },
  { label: "Bubble zero and missing sizes", props: {
    kind: "bubble",
    title: "Market reporting progress",
    description: "2025 · Revenue is zero or not yet reported for some markets.",
    sizeLabel: "Revenue ($m)",
    sizeSuffix: "m",
    xAxis: {label: "Revenue growth (%)", suffix: "%"},
    yAxis: {label: "Operating margin (%)", suffix: "%"},
    labels: "none",
    series: [
      {id: "core", label: "Core markets", role: "positive"},
      {id: "growth", label: "Growth markets", role: "neutral"},
    ],
    data: [
      {id: "a", label: "North", seriesId: "core", x: 12, y: 18, size: 25},
      {id: "zero", label: "Zero size", seriesId: "core", x: 40, y: 20, size: 0},
      {id: "missing", label: "Missing size", seriesId: "growth", x: 10, y: 20, size: null},
    ],
    sizeLegend: false,
    dataTable: "visible",
  } },
  { label: "Bubble empty", props: {
    kind: "bubble",
    title: "New market launch",
    description: "2025 · Revenue has not yet been recorded.",
    sizeLabel: "Revenue ($m)",
    sizeSuffix: "m",
    xAxis: {label: "Revenue growth (%)", suffix: "%"},
    yAxis: {label: "Operating margin (%)", suffix: "%"},
    series: [
      {id: "core", label: "Core markets", role: "positive"},
      {id: "growth", label: "Growth markets", role: "neutral"},
    ],
    data: [
      {id: "zero", label: "Zero size", seriesId: "core", x: 40, y: 20, size: 0},
    ],
  } },
  { label: "Bubble coincident observations", props: {
    kind: "bubble",
    title: "Two markets, the same performance",
    description: "2025 · Equal growth and margin, different annual revenue.",
    sizeLabel: "Revenue ($m)",
    sizeSuffix: "m",
    series: [
      {id: "core", label: "Core markets", role: "positive"},
      {id: "growth", label: "Growth markets", role: "neutral"},
    ],
    labels: "outside",
    data: [
      {id: "small", label: "Small market", seriesId: "core", x: 10, y: 10, size: 25},
      {id: "large", label: "Large market", seriesId: "growth", x: 10, y: 10, size: 100},
    ],
    xAxis: {label: "Revenue growth (%)", suffix: "%", domain: [0, 20]},
    yAxis: {label: "Operating margin (%)", suffix: "%", domain: [0, 20]},
  } },
  { label: "Bubble large labels", props: {
    kind: "bubble",
    title: "North and South market performance",
    description: "2025 · Circle area represents annual revenue in million dollars.",
    sizeLabel: "Revenue ($m)",
    sizeSuffix: "m",
    xAxis: {label: "Revenue growth (%)", suffix: "%"},
    yAxis: {label: "Operating margin (%)", suffix: "%"},
    series: [
      {id: "core", label: "Core markets", role: "positive"},
      {id: "growth", label: "Growth markets", role: "neutral"},
    ],
    data: [
      {id: "a", label: "North", seriesId: "core", x: 12, y: 18, size: 25},
      {id: "b", label: "South", seriesId: "core", x: 30, y: 40, size: 100},
    ],
    labels: "outside",
    brand: {version: 1, typography: {labelSize: 24}, bubble: {maxRadius: 60}},
  } },
  {
  label: "Responsive financial bars",
  props: {
    preset: "large-type",
    animation: "none",
    dataTable: "visible",
    kind: "bar",
    title: "Quarterly revenue",
    layout: "stacked",
    numberFormat: {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    },
    data: [
      {
        id: "2025-q1",
        label: "Q1 2025",
        values: {
          enterprise: 420000,
          "mid-market": 280000,
          "small-business": 160000
        }
      },
      {
        id: "2025-q2",
        label: "Q2 2025",
        values: {
          enterprise: 480000,
          "mid-market": 310000,
          "small-business": 175000
        }
      },
      {
        id: "2025-q3",
        label: "Q3 2025",
        values: {
          enterprise: 540000,
          "mid-market": 330000,
          "small-business": 190000
        }
      },
      {
        id: "2025-q4",
        label: "Q4 2025",
        values: {
          enterprise: 630000,
          "mid-market": 355000,
          "small-business": 210000
        }
      },
      {
        id: "2026-q1",
        label: "Q1 2026",
        values: {
          enterprise: 690000,
          "mid-market": 375000,
          "small-business": 220000
        }
      },
      {
        id: "2026-q2",
        label: "Q2 2026",
        values: {
          enterprise: 760000,
          "mid-market": 405000,
          "small-business": 240000
        }
      },
      {
        id: "2026-q3",
        label: "Q3 2026",
        values: {
          enterprise: 850000,
          "mid-market": 430000,
          "small-business": 255000
        }
      },
      {
        id: "2026-q4",
        label: "Q4 2026",
        values: {
          enterprise: 960000,
          "mid-market": 465000,
          "small-business": 275000
        }
      }
    ],
    series: [
      {
        id: "enterprise",
        label: "Enterprise customers with annual agreements"
      },
      {
        id: "mid-market",
        label: "Mid-market"
      },
      {
        id: "small-business",
        label: "Small business"
      }
    ]
  }
},
  {
  label: "Responsive financial line",
  props: {
    preset: "large-type",
    animation: "none",
    dataTable: "visible",
    kind: "line",
    title: "Revenue by customer segment",
    description: "Quarterly results · In euros",
    numberFormat: {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    },
    data: [
      {
        id: "2025-q1",
        label: "Q1 2025",
        values: {
          enterprise: 420000,
          "mid-market": 280000,
          "small-business": 160000
        }
      },
      {
        id: "2025-q2",
        label: "Q2 2025",
        values: {
          enterprise: 480000,
          "mid-market": 310000,
          "small-business": 175000
        }
      },
      {
        id: "2025-q3",
        label: "Q3 2025",
        values: {
          enterprise: 540000,
          "mid-market": 330000,
          "small-business": 190000
        }
      },
      {
        id: "2025-q4",
        label: "Q4 2025",
        values: {
          enterprise: 630000,
          "mid-market": 355000,
          "small-business": 210000
        }
      },
      {
        id: "2026-q1",
        label: "Q1 2026",
        values: {
          enterprise: 690000,
          "mid-market": 375000,
          "small-business": 220000
        }
      },
      {
        id: "2026-q2",
        label: "Q2 2026",
        values: {
          enterprise: 760000,
          "mid-market": 405000,
          "small-business": 240000
        }
      },
      {
        id: "2026-q3",
        label: "Q3 2026",
        values: {
          enterprise: 850000,
          "mid-market": 430000,
          "small-business": 255000
        }
      },
      {
        id: "2026-q4",
        label: "Q4 2026",
        values: {
          enterprise: 960000,
          "mid-market": 465000,
          "small-business": 275000
        }
      }
    ],
    series: [
      {
        id: "enterprise",
        label: "Enterprise customers with annual agreements"
      },
      {
        id: "mid-market",
        label: "Mid-market"
      },
      {
        id: "small-business",
        label: "Small business"
      }
    ]
  }
},
  { label: 'Revenue by customer segment', props: {
    kind: 'pie', variant: 'donut', preset: 'editorial',
    title: 'Revenue by customer segment', description: 'Annual recurring revenue in euros · Sample data',
    centerValue: '€1.7M', centerLabel: 'Annual revenue', dataTable: 'visible',
    numberFormat: { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 },
    data: [
      { id: 'enterprise', label: 'Enterprise customers with annual agreements', value: 950000 },
      { id: 'mid-market', label: 'Mid-market', value: 530000 },
      { id: 'small-business', label: 'Small business', value: 220000 },
    ],
  } },
  {
  label: "Responsive scatter labels",
  props: {
    preset: "large-type",
    animation: "none",
    dataTable: "visible",
    series: [
      {
        id: "markets",
        label: "Markets with a long descriptive legend entry"
      }
    ],
    labels: "outside",
    xAxis: {
      label: "Investment in euros",
      numberFormat: {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0
      }
    },
    yAxis: {
      label: "Margin",
      numberFormat: {
        style: "percent"
      }
    },
    data: [
      {
        id: "a",
        label: "Northern market with a long observation name",
        seriesId: "markets",
        x: 120000,
        y: 0.12,
        size: 250000
      },
      {
        id: "b",
        label: "Western market",
        seriesId: "markets",
        x: 470000,
        y: 0.28,
        size: 1000000
      },
      {
        id: "c",
        label: "Eastern market",
        seriesId: "markets",
        x: 900000,
        y: 0.5,
        size: 500000
      }
    ],
    kind: "scatter",
    title: "Investment and margin",
    trendLine: "linear"
  }
},
  {
  label: "Responsive bubble labels",
  props: {
    preset: "large-type",
    animation: "none",
    dataTable: "visible",
    series: [
      {
        id: "markets",
        label: "Markets with a long descriptive legend entry"
      }
    ],
    labels: "outside",
    xAxis: {
      label: "Investment in euros",
      numberFormat: {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0
      }
    },
    yAxis: {
      label: "Margin",
      numberFormat: {
        style: "percent"
      }
    },
    data: [
      {
        id: "a",
        label: "Northern market with a long observation name",
        seriesId: "markets",
        x: 120000,
        y: 0.12,
        size: 250000
      },
      {
        id: "b",
        label: "Western market",
        seriesId: "markets",
        x: 470000,
        y: 0.28,
        size: 1000000
      },
      {
        id: "c",
        label: "Eastern market",
        seriesId: "markets",
        x: 900000,
        y: 0.5,
        size: 500000
      }
    ],
    kind: "bubble",
    title: "Market opportunities",
    sizeLabel: "Revenue",
    sizeMax: 1000000,
    sizeNumberFormat: {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    }
  }
},
  {
  label: "Deliberately scrollable bars",
  props: {
    kind: "bar",
    sizing: "scroll",
    title: "Monthly performance",
    data: [
      {
        id: "2025-q1",
        label: "Q1 2025",
        values: {
          enterprise: 420000,
          "mid-market": 280000,
          "small-business": 160000
        }
      },
      {
        id: "2025-q2",
        label: "Q2 2025",
        values: {
          enterprise: 480000,
          "mid-market": 310000,
          "small-business": 175000
        }
      },
      {
        id: "2025-q3",
        label: "Q3 2025",
        values: {
          enterprise: 540000,
          "mid-market": 330000,
          "small-business": 190000
        }
      },
      {
        id: "2025-q4",
        label: "Q4 2025",
        values: {
          enterprise: 630000,
          "mid-market": 355000,
          "small-business": 210000
        }
      },
      {
        id: "2026-q1",
        label: "Q1 2026",
        values: {
          enterprise: 690000,
          "mid-market": 375000,
          "small-business": 220000
        }
      },
      {
        id: "2026-q2",
        label: "Q2 2026",
        values: {
          enterprise: 760000,
          "mid-market": 405000,
          "small-business": 240000
        }
      },
      {
        id: "2026-q3",
        label: "Q3 2026",
        values: {
          enterprise: 850000,
          "mid-market": 430000,
          "small-business": 255000
        }
      },
      {
        id: "2026-q4",
        label: "Q4 2026",
        values: {
          enterprise: 960000,
          "mid-market": 465000,
          "small-business": 275000
        }
      }
    ],
    series: [
      {
        id: "enterprise",
        label: "Enterprise customers with annual agreements"
      },
      {
        id: "mid-market",
        label: "Mid-market"
      },
      {
        id: "small-business",
        label: "Small business"
      }
    ]
  }
},
  {
  label: "Dense responsive categories",
  props: {
    kind: "bar",
    title: "Detailed monthly performance",
    data: [
      {
        id: "0",
        label: "Month 1",
        values: {
          sales: 4
        }
      },
      {
        id: "1",
        label: "Month 2",
        values: {
          sales: 11
        }
      },
      {
        id: "2",
        label: "Month 3",
        values: {
          sales: 18
        }
      },
      {
        id: "3",
        label: "Month 4",
        values: {
          sales: 25
        }
      },
      {
        id: "4",
        label: "Month 5",
        values: {
          sales: 32
        }
      },
      {
        id: "5",
        label: "Month 6",
        values: {
          sales: 9
        }
      },
      {
        id: "6",
        label: "Month 7",
        values: {
          sales: 16
        }
      },
      {
        id: "7",
        label: "Month 8",
        values: {
          sales: 23
        }
      },
      {
        id: "8",
        label: "Month 9",
        values: {
          sales: 30
        }
      },
      {
        id: "9",
        label: "Month 10",
        values: {
          sales: 7
        }
      },
      {
        id: "10",
        label: "Month 11",
        values: {
          sales: 14
        }
      },
      {
        id: "11",
        label: "Month 12",
        values: {
          sales: 21
        }
      },
      {
        id: "12",
        label: "Month 13",
        values: {
          sales: 28
        }
      },
      {
        id: "13",
        label: "Month 14",
        values: {
          sales: 5
        }
      },
      {
        id: "14",
        label: "Month 15",
        values: {
          sales: 12
        }
      },
      {
        id: "15",
        label: "Month 16",
        values: {
          sales: 19
        }
      },
      {
        id: "16",
        label: "Month 17",
        values: {
          sales: 26
        }
      },
      {
        id: "17",
        label: "Month 18",
        values: {
          sales: 33
        }
      },
      {
        id: "18",
        label: "Month 19",
        values: {
          sales: 10
        }
      },
      {
        id: "19",
        label: "Month 20",
        values: {
          sales: 17
        }
      }
    ],
    series: [
      {
        id: "sales",
        label: "Sales"
      }
    ]
  }
},
  { label: 'Bottom bar legend', props: {
    kind: 'bar', title: 'Revenue by quarter', legendPosition: 'bottom',
    series: [{ id: 'revenue', label: 'Revenue' }, { id: 'cost', label: 'Cost' }, { id: 'profit', label: 'Profit' }],
    data: [
      { id: 'q1', label: 'Q1', values: { revenue: 24, cost: 18, profit: 6 } },
      { id: 'q2', label: 'Q2', values: { revenue: 32, cost: 20, profit: 12 } },
      { id: 'q3', label: 'Q3', values: { revenue: 28, cost: 18, profit: 10 } },
      { id: 'q4', label: 'Q4', values: { revenue: 40, cost: 25, profit: 15 } },
    ],
  } },
  { label: 'Right-side brand legend', props: {
    kind: 'bar', preset: 'editorial', title: 'Revenue composition', layout: 'stacked', legendPosition: 'right',
    series: [{ id: 'revenue', label: 'Recurring revenue' }, { id: 'cost', label: 'Services' }, { id: 'profit', label: 'Other income' }],
    data: [{ id: 'q1', label: 'Q1', values: { revenue: 24, cost: 8, profit: 3 } }, { id: 'q2', label: 'Q2', values: { revenue: 30, cost: 7, profit: 4 } }],
  } },
  { label: 'Customer acquisition channels', props: {
    kind: 'pie', variant: 'donut', title: 'Where new customers come from',
    description: '200 new customers this quarter · Sample data',
    outsideLabelLayout: 'radial',
    brand: { ...editorialChartBrand, pie: { innerRadius: 0.6, categoryLabels: 'outside', valueLabels: 'inside', legend: false } },
    data: [
      { id: 'organic', label: 'Organic search', value: 90 },
      { id: 'referrals', label: 'Referrals', value: 60 },
      { id: 'paid', label: 'Paid campaigns', value: 50 },
    ],
  } },
  { label: 'Electricity from renewable sources', props: {
    kind: 'pie', title: 'Electricity supply', description: '1,000 MWh consumed across our offices · Sample data', colorMode: 'semantic',
    brand: { ...editorialChartBrand, pie: { categoryLabels: 'inside', valueLabels: 'inside', legend: false } },
    data: [
      { id: 'renewable', label: 'Renewable', value: 780, role: 'positive' },
      { id: 'grid', label: 'Other', value: 220, role: 'neutral' },
    ],
  } },
  { label: 'Simple bars with inside values', props: {
    kind: 'bar', preset: 'editorial', title: 'Revenue', valueLabels: 'inside', legend: false,
    series: [{ id: 'revenue', label: 'Revenue' }],
    data: [{ id: 'q1', label: 'Q1', values: { revenue: 24 } }, { id: 'q2', label: 'Q2', values: { revenue: 40 } }],
  } },
];
