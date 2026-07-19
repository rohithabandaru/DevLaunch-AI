"use client";

/* ──────────────── Reusable SVG Chart Components ──────────────── */

type DonutSegment = { label: string; value: number; color: string };

export function DonutChart({
  segments,
  size = 200,
}: {
  segments: DonutSegment[];
  size?: number;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 20;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg, index) => {
          const pct = seg.value / total;
          const dashLen = pct * circumference;
          const prevSum = segments.slice(0, index).reduce((acc, s) => acc + (s.value / total), 0);
          const dashOffset = -prevSum * circumference;
          return (
            <circle
              key={seg.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              className="transition-all duration-500"
            />
          );
        })}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          className="fill-slate-900 font-extrabold text-2xl"
          style={{ fontSize: 24 }}
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          className="fill-slate-500 font-semibold"
          style={{ fontSize: 11 }}
        >
          Total
        </text>
      </svg>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-slate-600 font-medium">
              {seg.label}{" "}
              <span className="font-bold text-slate-800">{seg.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

type BarDatum = { label: string; value: number; color?: string };

export function HBarChart({
  data,
  maxValue,
}: {
  data: BarDatum[];
  maxValue?: number;
}) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-24 text-xs font-semibold text-slate-600 text-right truncate shrink-0">
            {d.label}
          </span>
          <div className="flex-1 bg-slate-100 h-5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(d.value / max) * 100}%`,
                backgroundColor: d.color ?? "#6366f1",
              }}
            />
          </div>
          <span className="text-xs font-bold text-slate-700 w-6 text-right">
            {d.value}
          </span>
        </div>
      ))}
    </div>
  );
}

type LineDatum = { label: string; value: number };

export function LineChart({
  data,
  height = 180,
  color = "#6366f1",
}: {
  data: LineDatum[];
  height?: number;
  color?: string;
}) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const w = 500;
  const h = height;
  const plotW = w - padding.left - padding.right;
  const plotH = h - padding.top - padding.bottom;

  const points = data.map((d, i) => ({
    x: padding.left + (i / Math.max(data.length - 1, 1)) * plotW,
    y: padding.top + plotH - (d.value / max) * plotH,
    ...d,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
    .join(" ");

  return (
    <svg
      className="w-full"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ height }}
    >
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = padding.top + plotH - pct * plotH;
        return (
          <g key={pct}>
            <line
              x1={padding.left}
              y1={y}
              x2={w - padding.right}
              y2={y}
              stroke="#f1f5f9"
              strokeWidth={1}
            />
            <text
              x={padding.left - 6}
              y={y + 4}
              textAnchor="end"
              className="fill-slate-400"
              style={{ fontSize: 9 }}
            >
              {Math.round(max * pct)}
            </text>
          </g>
        );
      })}

      {/* Line path */}
      <path d={pathD} fill="none" stroke={color} strokeWidth={2.5} />

      {/* Dots and x-axis labels */}
      {points.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r={4} fill={color} stroke="white" strokeWidth={1.5} />
          <text
            x={p.x}
            y={h - 6}
            textAnchor="middle"
            className="fill-slate-500 font-semibold"
            style={{ fontSize: 9 }}
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function VBarChart({
  data,
  height = 180,
}: {
  data: BarDatum[];
  height?: number;
}) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const padding = { top: 20, right: 10, bottom: 30, left: 40 };
  const w = 500;
  const h = height;
  const plotW = w - padding.left - padding.right;
  const plotH = h - padding.top - padding.bottom;
  const barW = Math.min(plotW / data.length - 8, 40);

  return (
    <svg
      className="w-full"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ height }}
    >
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = padding.top + plotH - pct * plotH;
        return (
          <g key={pct}>
            <line
              x1={padding.left}
              y1={y}
              x2={w - padding.right}
              y2={y}
              stroke="#f1f5f9"
              strokeWidth={1}
            />
            <text
              x={padding.left - 6}
              y={y + 4}
              textAnchor="end"
              className="fill-slate-400"
              style={{ fontSize: 9 }}
            >
              {Math.round(max * pct)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const x =
          padding.left + (i + 0.5) * (plotW / data.length) - barW / 2;
        const barH = (d.value / max) * plotH;
        const y = padding.top + plotH - barH;
        return (
          <g key={d.label}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={4}
              fill={d.color ?? "#6366f1"}
              className="transition-all duration-500"
            />
            <text
              x={x + barW / 2}
              y={y - 6}
              textAnchor="middle"
              className="fill-slate-700 font-bold"
              style={{ fontSize: 10 }}
            >
              {d.value}
            </text>
            <text
              x={x + barW / 2}
              y={h - 6}
              textAnchor="middle"
              className="fill-slate-500 font-semibold"
              style={{ fontSize: 9 }}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
