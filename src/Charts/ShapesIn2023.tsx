import { useMemo } from "react";
import * as d3 from "d3";

export default function ShapesIn2023({
  ufoData,
  boundsWidth,
  boundsHeight,
  MARGIN,
}: {
  ufoData: { [shape: string]: number }[];
  boundsWidth: number;
  boundsHeight: number;
  MARGIN: { top: number; right: number; bottom: number; left: number };
}) {
  const radius =
    Math.min(boundsWidth - 2 * MARGIN.top, boundsHeight - 2 * MARGIN.left) / 2;

  const pie = useMemo(() => {
    const pieGen = d3.pie().value((d) => { 
      console.log('d', d);
      
      return d.count});
    console.log('generator', pieGen(ufoData));
    return pieGen(ufoData);
  }, [ufoData]);

  const arc = d3.arc();

  const slices = pie.map((slice, i) => {
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
    // make legend lines longer according to smaller size? 
    // figure out colors you want to use and finmd the d3 system to implement those

    return (
      <g key={label}>
        <path d={path} fill="white" stroke="white" stroke-width="4" opacity="0.1" />
        <circle cx={center[0]} cy={center[1]} r={2} stroke="white" fill="white" />
        <line
          x1={center[0]}
          y1={center[1]}
          x2={legendCenter[0]}
          y2={legendCenter[1]}
          stroke={"white"}
          fill={"white"}
        />
        <line
          x1={legendCenter[0]}
          y1={legendCenter[1]}
          x2={labelX}
          y2={legendCenter[1]}
          stroke={"white"}
          fill={"white"}
        />
        <text
          x={labelX + (isRightLeaning ? 2 : -2)}
          y={legendCenter[1]}
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
    <div>
      <svg viewBox={`-20 0 ${boundsWidth + 150} ${boundsHeight + 120}`}>
        <g transform={`translate(${boundsWidth / 2}, ${boundsHeight / 2})`}>
          {slices}
        </g>
      </svg>
    </div>
  );
}
