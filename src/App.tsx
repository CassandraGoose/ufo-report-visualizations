import { useState, useRef, useEffect, useMemo } from "react";
import * as d3 from "d3";

import "./App.css";
import ufo from "./assets/ufo.png";

export interface Sighting {
  year: string;
  city: string;
  state: string;
  country: string;
  shape: string;
  summary: null | string;
  reportedDate: string;
  explanation: null | string;
  count: number;
}

const MARGIN = { top: 50, right: 50, bottom: 60, left: 80 };

function App() {
  const { innerWidth: width, innerHeight: height } = window;
  const [loading, setLoading] = useState(false);
  const [ufoData, setUfoData] = useState<Sighting[]>([]);
  const axesRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  useEffect(() => {
    const getData = async () => {
      const response = await fetch("./byYearsOfShapes.json");
      const data = await response.json();
      setUfoData(data);
    };

    getData();
  }, []);

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
      .range([0, boundsWidth]);
  }, [boundsWidth, ufoData]);

  useEffect(() => {
    const svgElement = d3.select(axesRef.current);
    svgElement.selectAll("*").remove();
    const xAxisGenerator = d3.axisBottom(xScale);
    svgElement
      .append("g")
      .attr("transform", "translate(0," + boundsHeight + ")")
      .call(xAxisGenerator);

    const yAxisGenerator = d3.axisLeft(yScale);
    svgElement.append("g").call(yAxisGenerator);
  }, [xScale, yScale, boundsHeight]);

  const allPath = series.map((serie, i) => {
    // let y = series.find((d) => d.key === sighting.shape)?.find((d) => d.data[0].toString() === sighting.year)?.[1];
    const sighting = ufoData.find((d) => d.shape === serie.key);
    return (
      <g key={i}>
        {serie.map((group, j) => {
          return (
            <g>
              <g key={sighting!.year + sighting!.shape}>
              <text
                y={yScale(group[1]) + (yScale(group[0]) - yScale(group[1]))/2}
                x={xScale(group.data[0].toString())! +((xScale.bandwidth()/2))}
                textAnchor="middle"
                alignmentBaseline="central"
                fontSize={12}
                opacity={yScale(group[1]) > 90 ? 1 : 0}
              >
                {sighting!.shape}
              </text>
            </g>
            <g>
              <rect
                key={j}
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

  // const allLabels = ufoData.map((sighting, i) => {
    // let y = series.find((d) => d.key === sighting.shape)?.find((d) => d.data[0].toString() === sighting.year)?.[1];
  //   const x = xScale(sighting.year);
  //   console.log(x);
  //   y = yScale(y);

  //   console.log(xScale.bandwidth())
  //   return (
  //     <g key={sighting.year + sighting.shape}>
  //       <text
  //         y={y + 80}
  //         x={x+i}
  //         textAnchor="end"
  //         alignmentBaseline="central"
  //         fontSize={12}
  //         opacity={y > 90 ? 1 : 0}
  //       >
  //         {sighting.shape}
  //       </text>
  //     </g>
  //   );
  // });

  return (
    <>
      <div className="ufo-container">
        {loading && (
          <img className="ufo" src={ufo} alt="line art icon of ufo" />
        )}
        {!loading && (
          <svg width={width} height={height}>
            <g
              width={boundsWidth}
              height={boundsHeight}
              transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
            >
              {allPath}
            </g>
            {/* <g>{allLabels}</g> */}
            <g
              width={boundsWidth}
              height={boundsHeight}
              ref={axesRef}
              transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
            />
          </svg>
        )}
      </div>
    </>
  );
}

export default App;
