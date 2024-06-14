import { useRef, useEffect, useMemo } from "react";
import * as d3 from "d3";
import { Sighting } from "../interfaces";

export default function ShapesByYearStackedHistogram({
  ufoData,
  boundsWidth,
  boundsHeight,
  MARGIN,
  colors,
}: {
  ufoData: Sighting[];
  boundsWidth: number;
  boundsHeight: number;
  MARGIN: { top: number; right: number; bottom: number; left: number };
  colors: (t: number) => string;
}) {
  const axesRef = useRef(null);
  const chartRef = useRef(null);
  const wrapperRef = useRef(null);

  const keys = d3.union(ufoData.map((d) => d.shape));

  const index = d3.index(
    ufoData,
    (d) => d.year,
    (d) => d.shape
  ) as unknown as Iterable<{ [key: string]: number }>;

  const series = d3
    .stack()
    .keys(keys)
    .value((data, key) => {
      const group = data[1] as unknown as Map<string, Sighting>;
      return group.get(key)?.count || 0;
    })(index);

  const maxValue = d3.max(series, (d) => d3.max(d, (d) => d[1]));

  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, maxValue || 0])
      .range([boundsHeight, 0]);
  }, [boundsHeight, maxValue]);

  const sortedYears = useMemo(() => {
    return Array.from(new Set(ufoData.map((d) => d.year))).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );
  }, [ufoData]);

  const xScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(sortedYears)
      .range([0, boundsWidth])
      .padding(0.1);
  }, [boundsWidth, sortedYears]);

  const xAxisGenerator = d3.axisBottom(xScale);

  useEffect(() => {
    const svgElement = d3.select(axesRef.current);
    svgElement.selectAll("*").remove();
    const xAxis = svgElement
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + boundsHeight + ")")
      .call(xAxisGenerator);

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
      .text("Year");

    svgElement
      .append("text")
      .attr("font-size", "20")
      .attr("class", "y-axis-title")
      .attr("text-anchor", "middle")
      .attr("transform", `rotate(-90)`)
      .attr("fill", "#f1f1f1")
      .attr("y", -MARGIN.left + 20)
      .attr("x", -boundsHeight / 2)
      .text("Reported Shapes of UFO Sightings");

    const yAxisGenerator = d3.axisLeft(yScale);
    const yAxis = svgElement.append("g").call(yAxisGenerator);

    yAxis.selectAll("text").attr("font-size", 14);
  }, [yScale, boundsHeight, boundsWidth, xAxisGenerator, xScale, MARGIN.bottom, MARGIN.left]);

  const allPath = series.map((serie, i) => {
    const sighting = ufoData.find((d) => d.shape === serie.key);
    return (
      <g key={i}>
        {serie.map((group, j) => {
          const canHaveLabel = group[1] - group[0] > 150;
          return (
            <g key={j}>
              <g key={sighting!.year + sighting!.shape}>
                {canHaveLabel && (
                  <text
                    y={
                      yScale(group[1]) +
                      (yScale(group[0]) - yScale(group[1]) + 7) / 2
                    }
                    x={
                      xScale(group.data[0].toString())! + xScale.bandwidth() / 2
                    }
                    textAnchor="middle"
                    alignmentBaseline="central"
                    fontSize={14}
                    opacity={yScale(group[1]) > 90 ? 1 : 0}
                    fill="#f1f1f1"
                  >
                    {serie.key}
                  </text>
                )}
              </g>
              <g>
                <rect
                  stroke="white"
                  stroke-width="0.5"
                  fill={colors(i * 0.06)} 
                  fillOpacity={0.3}
                  x={xScale(group.data[0].toString())}
                  width={xScale.bandwidth() - 1}
                  y={yScale(group[1])}
                  height={yScale(group[0]) - yScale(group[1])}
                >
                  <title>{serie.key}</title>
                </rect>
              </g>
            </g>
          );
        })}
      </g>
    );
  });

  return (
    <div ref={wrapperRef} className="flex-col">
      <p className="font-important chart-title">Reported UFO Shapes by Year, 2018-2023</p>
      <p>Ability to zoom coming soon. Hover for tooltip information.</p>
      <svg viewBox={`-20 0 ${boundsWidth + 150} ${boundsHeight + 120}`} ref={chartRef}>
        <g
          width={boundsWidth -200}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {allPath}
        <g
          width={boundsWidth}
          height={boundsHeight}
          ref={axesRef}
        />
        </g>
      </svg>
    </div>
  );
}
