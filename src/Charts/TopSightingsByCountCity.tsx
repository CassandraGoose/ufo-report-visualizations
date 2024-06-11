import { useMemo, useRef, useEffect } from "react";
import * as d3 from "d3";
import { SightingCounts } from "../interfaces";

export default function TopSightingsByCountCity({
  ufoData,
  boundsWidth,
  boundsHeight,
  MARGIN,
}: {
  ufoData: SightingCounts[];
  boundsWidth: number;
  boundsHeight: number;
  MARGIN: { top: number; right: number; bottom: number; left: number };
}) {
  const axesRef = useRef(null);

  const maxValue = d3.max(
    ufoData,
    (d) => d.totalCount as number
  ) as unknown as number;

  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, maxValue! || 0])
      .range([0, boundsWidth]);
  }, [boundsWidth, maxValue]);

  const yScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(ufoData.map((sighting) => sighting.city) as string[])
      .range([0, boundsHeight])
      .padding(0.1);
  }, [boundsHeight, ufoData]);

  useEffect(() => {
    const svgElement = d3.select(axesRef.current);
    svgElement.selectAll("*").remove();
    const xAxis = svgElement
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + boundsHeight + ")")
      .call(d3.axisBottom(xScale));

    xAxis.selectAll("text").attr("font-size", 14);

    svgElement
      .append("text")
      .attr("class", "x-axis-title")
      .attr("fill", "#f1f1f1")
      .attr("text-anchor", "middle")
      .attr(
        "transform",
        `translate(${boundsWidth / 2},${boundsHeight + MARGIN.bottom - 10})`
      )
      .attr("font-size", "20")
      .text("Count of Reported Sightings");
  });

  const bars = ufoData.map((sighting) => {
    const y = yScale(sighting.city);

    if (y === undefined) return null;
    return (
      <g key={sighting.city}>
        <rect
          x={xScale(0)}
          y={yScale(sighting.city)}
          width={xScale(sighting.totalCount)}
          height={yScale.bandwidth()}
          opacity={0.7}
          stroke="white"
          fill="white"
          fillOpacity={0.2}
          strokeWidth={1}
          rx={1}
        />
        <text
          x={xScale(sighting.totalCount) - 7}
          y={y + yScale.bandwidth() / 2}
          textAnchor="end"
          alignmentBaseline="central"
          fontSize={14}
          fill="white"
          stroke="white"
          opacity={xScale(sighting.totalCount) > 90 ? 1 : 0}
        >
          {sighting.totalCount}
        </text>
        <text
          x={xScale(0) + 7}
          y={y + yScale.bandwidth() / 2}
          textAnchor="start"
          fill="white"
          stroke="white"
          alignmentBaseline="central"
          fontSize={14}
        >
          {sighting.city}
        </text>
      </g>
    );
  });

  const grid = xScale
    .ticks()
    .slice(1)
    .map((tick) => (
      <g key={tick}>
        <line
          x1={xScale(tick)}
          x2={xScale(tick)}
          y1={0}
          y2={boundsHeight}
          stroke="white"
          opacity={0.2}
        />
      </g>
    ));

  return (
    <div className="flex-col">
      <p className="font-important chart-title">
        Top 10 Cities with the Most Reported Sightings, 2018-2023
      </p>
      <svg viewBox={`-70 0 ${boundsWidth + 150} ${boundsHeight + 120}`}>
        {grid}
        {bars}
        <g width={boundsWidth} height={boundsHeight} ref={axesRef} />
      </svg>
    </div>
  );
}
