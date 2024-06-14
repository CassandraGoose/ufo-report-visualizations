import { useMemo, useRef } from "react";
import * as d3 from "d3";

export default function ShapesIn2023({
  ufoData,
  boundsWidth,
  boundsHeight,
  MARGIN,
  colors,
}: {
  ufoData: { [shape: string]: number }[];
  boundsWidth: number;
  boundsHeight: number;
  MARGIN: { top: number; right: number; bottom: number; left: number };
  colors: (t: number) => string;
}) {
  const chartRef = useRef(null);

  const radius =
    Math.min(boundsWidth - 2 * MARGIN.top, boundsHeight - 2 * MARGIN.left) / 2;

  const pie = useMemo(() => {
    const pieGen = d3.pie().value((d) => d.count);
    return pieGen(ufoData);
  }, [ufoData]);

  const arc = d3.arc();

  const slices = pie
    .sort((a, b) => b.data.count - a.data.count)
    .map((slice, i) => {
      const sliceInfo = {
        innerRadius: 0,
        outerRadius: radius,
        startAngle: slice.startAngle,
        endAngle: slice.endAngle,
      };

      const center = arc.centroid(sliceInfo);
      const path = arc(sliceInfo);

      const legendArcInfo = {
        innerRadius: radius + 10,
        outerRadius: radius + 10,
        startAngle: slice.startAngle,
        endAngle: slice.endAngle,
      };

      const legendCenter = arc.centroid(legendArcInfo);

      const isRightLeaning = legendCenter[0] > 0;
      const labelX = legendCenter[0] + 50 * (isRightLeaning ? 1 : -1);
      const textAnchor = isRightLeaning ? "start" : "end";
      const label = `${slice.data.shape} - ${slice.data.count}`;
      const staggeredY = legendCenter[1] + (i - pie.length / 2) * -20;
      const yLength = slice.data.count < 90 ? staggeredY : legendCenter[1];
      const flatYLocation =
        slice.data.count < 90 ? staggeredY : legendCenter[1];

      return (
        <g
          key={label}
          className="slice"
          onMouseEnter={() => {
            if (chartRef.current) {
              chartRef.current.classList.add("slice-active");
            }
          }}
          onMouseLeave={() => {
            if (chartRef.current) {
              chartRef.current.classList.remove("slice-active");
            }
          }}
        >
          <path d={path} fill={colors(i * 0.06)} stroke="none" opacity="0.7" />
          <circle
            cx={center[0]}
            cy={center[1]}
            r={2}
            stroke="white"
            fill="white"
          />
          <line
            x1={center[0]}
            y1={center[1]}
            x2={legendCenter[0]}
            y2={yLength}
            stroke={"white"}
            fill={"white"}
          />
          <line
            x1={legendCenter[0]}
            y1={flatYLocation}
            x2={labelX}
            y2={flatYLocation}
            stroke={"white"}
            fill={"white"}
          />
          <text
            x={labelX + (isRightLeaning ? 2 : -2)}
            y={flatYLocation}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            fill="white"
            fontSize={14}
          >
            {label}
          </text>
        </g>
      );
    });

  return (
    <div className="flex-col">
      <p className="font-important chart-title">Reported UFO Shapes, 2023</p>
      <svg viewBox={`-100 -200 ${boundsWidth + 150} ${boundsHeight + 220}`}>
        <g
          ref={chartRef}
          transform={`translate(${boundsWidth / 2}, ${boundsHeight / 2})`}
          className="pie"
        >
          {slices}
        </g>
      </svg>
    </div>
  );
}
