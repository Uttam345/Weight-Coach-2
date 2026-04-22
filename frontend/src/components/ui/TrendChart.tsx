import React from 'react';

interface DataPoint {
    date: string; // ISO date string
    value: number;
}

interface TrendChartProps {
    data: DataPoint[];
    color?: string;
    unit?: string;
    height?: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({
    data,
    color = '#ccff00',
    unit = '',
    height = 100,
}) => {
    if (!data || data.length < 2) {
        return (
            <div className="flex items-center justify-center text-gray-600 text-xs" style={{ height }}>
                Not enough data yet
            </div>
        );
    }

    const width = 400;
    const padding = { top: 12, right: 12, bottom: 20, left: 36 };
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    const values = data.map(d => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    const xStep = innerW / (data.length - 1);
    const toX = (i: number) => padding.left + i * xStep;
    const toY = (v: number) => padding.top + innerH - ((v - minVal) / range) * innerH;

    // Build SVG path
    const pathD = data
        .map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(d.value).toFixed(1)}`)
        .join(' ');

    // Area fill path
    const areaD = `${pathD} L ${toX(data.length - 1).toFixed(1)} ${(padding.top + innerH).toFixed(1)} L ${padding.left.toFixed(1)} ${(padding.top + innerH).toFixed(1)} Z`;

    const lastPoint = data[data.length - 1];

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="w-full"
            style={{ height }}
        >
            <defs>
                <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Area fill */}
            <path d={areaD} fill={`url(#grad-${color.replace('#', '')})`} />

            {/* Line */}
            <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Dots for each point */}
            {data.map((d, i) => (
                <circle
                    key={i}
                    cx={toX(i)}
                    cy={toY(d.value)}
                    r={i === data.length - 1 ? 4 : 2.5}
                    fill={color}
                    opacity={i === data.length - 1 ? 1 : 0.5}
                />
            ))}

            {/* Last value label */}
            <text
                x={toX(data.length - 1)}
                y={toY(lastPoint.value) - 8}
                textAnchor="middle"
                fill={color}
                fontSize="10"
                fontWeight="bold"
            >
                {lastPoint.value}{unit}
            </text>

            {/* Y axis labels */}
            <text x={padding.left - 4} y={padding.top + 4} textAnchor="end" fill="#6b7280" fontSize="9">
                {maxVal.toFixed(1)}
            </text>
            <text x={padding.left - 4} y={padding.top + innerH} textAnchor="end" fill="#6b7280" fontSize="9">
                {minVal.toFixed(1)}
            </text>

            {/* X axis date labels - first and last */}
            <text x={padding.left} y={height - 2} fill="#6b7280" fontSize="9">
                {new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
            <text x={width - padding.right} y={height - 2} textAnchor="end" fill="#6b7280" fontSize="9">
                {new Date(data[data.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
        </svg>
    );
};
