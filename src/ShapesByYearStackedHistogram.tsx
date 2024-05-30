import { useState, useRef, useEffect, useMemo } from "react";
import * as d3 from "d3";
import { Sighting } from "./interfaces";

const MARGIN = { top: 50, right: 50, bottom: 60, left: 80 };

export default function ShapesByYearStackedHistogram({
  ufoData,
}: {
  ufoData: Sighting[];
}) {
  const { innerWidth: width, innerHeight: height } = window;
  const axesRef = useRef(null);
  const chartRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  const [zoomTransform, setZoomTransform] = useState(d3.zoomIdentity);

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

  const xScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(ufoData.map((d) => d.year))
      .range([0, boundsWidth])
      .padding(0.1);
  }, [boundsWidth, ufoData]);
  const xAxisGenerator = d3.axisBottom(xScale);

  useEffect(() => {
    const svgElement = d3.select(axesRef.current);
    svgElement.selectAll("*").remove();
    svgElement
      .append("g")
      .attr("transform", "translate(0," + boundsHeight + ")")
      .call(xAxisGenerator);

    const yAxisGenerator = d3.axisLeft(yScale);
    svgElement.append("g").call(yAxisGenerator);
  }, [yScale, boundsHeight, xAxisGenerator]);

  useEffect(() => {
    const svg = d3.select(chartRef.current);
    const extent = [
      [MARGIN.left, MARGIN.top],
      [width - MARGIN.right, height - MARGIN.top],
    ];

    function zoomed(event: any) {
      const transform = event.transform;
      setZoomTransform(transform);
      xScale.range(
        [MARGIN.left, width - MARGIN.right].map((d) =>
          event.transform.applyX(d)
        )
      );
      svg
        .selectAll("rect")
        .data(ufoData)
        .attr("x", (d: any) => xScale(d.shape))
        .attr("width", xScale.bandwidth());
      svg.selectAll(".x-axis").call(xAxisGenerator);
    }

    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .translateExtent(extent)
      .extent(extent)
      .on("zoom", zoomed);

    svg.call(zoom);
  }, [height, width, xScale, xAxisGenerator]);

  const allPath = series.map((serie, i) => {
    const sighting = ufoData.find((d) => d.shape === serie.key);
    return (
      <g key={i}>
        {serie.map((group, j) => {
          return (
            <g key={j}>
              <g key={sighting!.year + sighting!.shape}>
                <text
                  y={
                    yScale(group[1]) + (yScale(group[0]) - yScale(group[1])) / 2
                  }
                  x={xScale(group.data[0].toString())! + xScale.bandwidth() / 2}
                  textAnchor="middle"
                  alignmentBaseline="central"
                  fontSize={12}
                  opacity={yScale(group[1]) > 90 ? 1 : 0}
                >
                  {serie.key}
                </text>
              </g>
              <g>
                <rect
                  stroke="black"
                  fill="#9a6fb0"
                  fillOpacity={j / 10 + 0.1}
                  x={xScale(group.data[0].toString())}
                  width={xScale.bandwidth() - 1}
                  y={yScale(group[1])}
                  height={yScale(group[0]) - yScale(group[1])}
                />
              </g>
            </g>
          );
        })}
      </g>
    );
  });

  return (
    <svg
      width={width}
      height={height}
      ref={chartRef}
      transform={zoomTransform.toString()}
    >
      <g
        width={boundsWidth}
        height={boundsHeight}
        transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
      >
        {allPath}
      </g>
      <g
        width={boundsWidth}
        height={boundsHeight}
        ref={axesRef}
        transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
      />
    </svg>
  );
}
