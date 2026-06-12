// A small, static, token-themed data chart. Pure SVG — no chart library,
// no client JS — so sections hosting it stay static (`hydrate` not needed).
// Colors ride the theme tokens (`fill-primary`, `fill-muted-foreground`),
// so the chart re-skins with the system like every other element.

/** One data point. */
export interface ChartDatum {
  /** Short category label under the bar/point. 1–2 words. */
  label: string;
  /** The value. Plain number — format any units into the caption. */
  value: number;
}

/**
 * A compact data chart for a media slot or stat beat. Best with 3–8
 * points; labels stay legible up to ~8. Static SVG, themed by tokens.
 */
export interface ChartBlockProps {
  kind: 'chart';
  /** Chart style. `bar` compares categories; `line` shows a trend. */
  type: 'bar' | 'line';
  /** Data points in display order. 3–8 entries. */
  data: ChartDatum[];
}

const W = 400;
const H = 260;
const PAD_X = 20;
const PAD_TOP = 18;
const PAD_BOTTOM = 36;

export function ChartBlock({ type, data }: ChartBlockProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const plotH = H - PAD_TOP - PAD_BOTTOM;
  const plotW = W - PAD_X * 2;
  const n = Math.max(1, data.length);
  const baselineY = H - PAD_BOTTOM;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={data.map((d) => `${d.label}: ${d.value}`).join(', ')}
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <line x1={PAD_X} y1={baselineY} x2={W - PAD_X} y2={baselineY} className="stroke-border" />
      {type === 'bar' ? <Bars data={data} max={max} plotH={plotH} plotW={plotW} /> : null}
      {type === 'line' ? <Line data={data} max={max} plotH={plotH} plotW={plotW} /> : null}
      {data.map((d, i) => {
        const slot = plotW / n;
        const cx = PAD_X + slot * i + slot / 2;
        return (
          <text
            key={i}
            x={cx}
            y={baselineY + 22}
            textAnchor="middle"
            fontSize={13}
            className="fill-muted-foreground"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

function Bars({
  data,
  max,
  plotH,
  plotW,
}: {
  data: ChartDatum[];
  max: number;
  plotH: number;
  plotW: number;
}) {
  const n = Math.max(1, data.length);
  const slot = plotW / n;
  const barW = Math.min(slot * 0.62, 56);
  return (
    <g>
      {data.map((d, i) => {
        const h = Math.max(2, (d.value / max) * plotH);
        const x = PAD_X + slot * i + (slot - barW) / 2;
        const y = PAD_TOP + plotH - h;
        return <rect key={i} x={x} y={y} width={barW} height={h} rx={4} className="fill-primary" />;
      })}
    </g>
  );
}

function Line({
  data,
  max,
  plotH,
  plotW,
}: {
  data: ChartDatum[];
  max: number;
  plotH: number;
  plotW: number;
}) {
  const n = Math.max(1, data.length);
  const slot = plotW / n;
  const points = data.map((d, i) => {
    const x = PAD_X + slot * i + slot / 2;
    const y = PAD_TOP + plotH - (d.value / max) * plotH;
    return { x, y };
  });
  return (
    <g>
      <polyline
        points={points.map((p) => `${p.x},${p.y}`).join(' ')}
        className="fill-none stroke-primary"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4.5} className="fill-primary" />
      ))}
    </g>
  );
}
