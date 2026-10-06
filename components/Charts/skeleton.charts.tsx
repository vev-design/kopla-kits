// Copy this SECTION into src/sections/. Keep the Charts import, stable IDs,
// saved brand binding, and semantic intent. Reshape every wrapper and replace
// the example data. Load font assets in the design system, not in each chart.
import { createBrandedCharts, type ChartBrand } from '@/components/Charts';

// Replace with the saved, reviewed brand specification. Keep this binding in
// one shared module when several sections use charts; do not mutate a global.
const brand: ChartBrand = { version: 1, seriesOrder: ['revenue', 'cost'] };
const { BarChart, PieChart, LineChart, ScatterChart, BubbleChart } = createBrandedCharts(brand);

export function ChartStory() {
  const series = [{ id: 'revenue', label: 'Revenue' }, { id: 'cost', label: 'Cost' }];
  const data = [
    { id: 'q1', label: 'Q1', values: { revenue: 24, cost: 18 } },
    { id: 'q2', label: 'Q2', values: { revenue: 32, cost: 20 } },
    { id: 'q3', label: 'Q3', values: { revenue: 28, cost: 18 } },
  ];
  return <section>
    <BarChart title="Revenue and cost" series={series} data={data} highlight={['revenue']} animation="enter" />
    <LineChart title="Quarterly trend" series={series} data={data} />
    <PieChart title="Responses" variant="donut" colorMode="semantic" centerValue="78%" centerLabel="Agree"
      data={[
        { id: 'agree', label: 'Agree', value: 78, role: 'positive' },
        { id: 'neutral', label: 'Neutral', value: 14, role: 'neutral' },
        { id: 'disagree', label: 'Disagree', value: 8, role: 'negative' },
      ]} />
    <ScatterChart title="Investment and return" xAxis={{ label: 'Investment' }} yAxis={{ label: 'Return', suffix: '%' }}
      series={[{ id: 'projects', label: 'Projects' }]} trendLine="linear" data={[
        { id: 'a', label: 'Project A', seriesId: 'projects', x: 10, y: 15 },
        { id: 'b', label: 'Project B', seriesId: 'projects', x: 40, y: 30 },
        { id: 'c', label: 'Project C', seriesId: 'projects', x: 90, y: 65 },
      ]} />
    <BubbleChart title="Market opportunities" xAxis={{ label: 'Growth', suffix: '%' }} yAxis={{ label: 'Margin', suffix: '%' }}
      sizeLabel="Revenue" sizeSuffix="m" sizeMax={100} series={[{ id: 'markets', label: 'Markets' }]} data={[
        { id: 'north', label: 'North', seriesId: 'markets', x: 12, y: 20, size: 25 },
        { id: 'south', label: 'South', seriesId: 'markets', x: 30, y: 40, size: 100 },
      ]} />
  </section>;
}
