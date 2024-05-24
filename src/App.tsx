// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useState, useRef, useEffect, useMemo } from "react";
import * as d3 from "d3";

import "./App.css";
import ufo from "./assets/ufo.png";

export interface Sighting {
  sightingDate: string;
  city: string;
  state: string;
  country: string;
  shape: string;
  summary: null | string;
  reportedDate: string;
  explanation: null | string;
}

const MARGIN = { top: 10, right: 10, bottom: 20, left: 40 };

type StackedAreaChartProps = {
  width: number;
  height: number;
  ufoData: { [key: string]: number | string }[];
};

function App() {
  const [loading, setLoading] = useState(false);
  const [ufoData, setUfoData] = useState<Sighting[]>([]);
  const axesRef = useRef(null);
  const [height, setHeight] = useState(500);
  const [width, setWidth] = useState(928);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  useEffect(() => {
    const getData = async () => {
      const response = await fetch("./byDatesOfShapes.json");
      const data = await response.json();
      const newData = data.map((item) => {
        item.date = new Date(item.date);
        return item;
      }).filter((item) => {
        return item.date > new Date("04/01/2024")
      })
      setUfoData(newData);

      // const keys = d3.union(newData.map((d) => d.shape));
      // const index = d3.index(
      //   newData,
      //   (d) => d.date,
      //   (d) => d.shape
      // );
      // console.log({ index });
      // const stackSeries = d3
      //   .stack()
      //   .keys(keys)
      //   .value(([, group], key) => {
      //     // console.log('key', key);
      //     const item = group.get(key);
      //     // console.log({item});
      //     if (item) return item.count
      //     return 0
      //     })(index);
      // console.log({stackSeries});      
      // console.log("setufodata");
    };

    getData();
  }, []);
  // Data Wrangling: stack the data
  const keys = d3.union(ufoData.map((d) => d.shape));
  const index = d3.index(
    ufoData,
    (d) => d.date,
    (d) => d.shape
  );
  const stackSeries = d3
    .stack()
    .keys(keys)
    .value(([, group], key) => {
      // data might look like shit because we are skipping some because group.get(key) is undefined the data is undefined in there. maybe check that .index() isn't having a fit.
      return group.get(key)?.count || 0})(index);
  const series = stackSeries;
  // Y axis
  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, d3.max(series, (d) => d3.max(d, (d) => d[1]))])
      .range([boundsHeight, 0]);
  }, [boundsHeight]);

  // X axis
  const [xMin, xMax] = d3.extent(ufoData, (d) => d.date);
  console.log({ xMin, xMax, ufoData });
  const xScale = useMemo(() => {
    return d3.scaleUtc([xMin || 0, xMax || 0], [0, boundsWidth]);
  }, [boundsWidth, xMin, xMax]);

  console.log(
    "xScale domain:",
    xScale.domain(),
    "xScale range:",
    xScale.range()
  );

  const areaBuilder = useMemo(() => {
    return (
      d3
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .area<any>()
        .x((d) => {
          // console.log("data: ", d.data[0], "x scale: ", xScale(d.data[0]));
          return xScale(d.data[0]);
        })
        .y0((d) => yScale(d[0]))
        .y1((d) => yScale(d[1]))
    );
  }, [xScale, yScale]);
  // Render the X and Y axis using d3.js, not react
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

  // Build the line

  const allPath = series.map((serie, i) => {
    // console.log("serie", serie);
    const path = areaBuilder(serie);
    return (
      <path
        key={i}
        d={path}
        opacity={1}
        stroke="black"
        fill="#9a6fb0"
        fillOpacity={i / 10 + 0.1}
      />
    );
  });

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

// {!loading && (
//   <svg
//     width="100%"
//     height="90%"
//     viewBox="0, 0, 100%, 90%"
//     className="svgChartContainer"
//   >
//     {/* data */}
//     {/* translate margin left margin top, pick whatever */}
//     <g transform="translate(40, 0)" width="982" height="500">{}</g>
//     {/* axes */}
//     <g width="982" height="500" ref={axesRef} transform="translate(40, 0)" />
//   </svg>
// )}
