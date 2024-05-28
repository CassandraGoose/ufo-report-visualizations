import { useState, useRef, useEffect, useMemo } from "react";
import * as d3 from "d3";

import "./App.css";
import ufo from "./assets/ufo.png";

export interface Sighting {
  date: string | Date;
  city: string;
  state: string;
  country: string;
  shape: string;
  summary: null | string;
  reportedDate: string;
  explanation: null | string;
  count: number;
}

const MARGIN = { top: 10, right: 10, bottom: 20, left: 40 };

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
      const newData = data
        .map((item: Sighting) => {
          item.date = new Date(item.date);
          return item;
        })
        .filter((item: Sighting) => {
          return item.date > new Date("04/01/2024");
        });
      setUfoData(newData);
    };

    getData();
  }, []);
  const keys = d3.union(ufoData.map((d) => d.shape));
  const index = d3.index(
    ufoData,
    (d) => d.date,
    (d) => d.shape
  ) as unknown as Iterable<{ [key: string]: number; }>;

  const stackSeries = d3
    .stack()
    .keys(keys)
    .value((data, key) => {
      const group = data[1] as unknown as Map<string, Sighting>;
      return group.get(key)?.count || 0;
    })(index);
  const series = stackSeries;

  const maxValue = d3.max(series, (d) => d3.max(d, (d) => d[1]));

  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, maxValue || 0])
      .range([boundsHeight, 0]);
  }, [boundsHeight, maxValue]);

  const [xMin, xMax] = d3.extent(ufoData, (d: Sighting) => d.date as Date);
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
    type areaData = number[] & { data: [Date, Map<number, string>] };
    return d3
      .area<areaData>()
      .x((d) => {
        return xScale(d.data[0]);
      })
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]));
  }, [xScale, yScale]);

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
    // @ts-expect-error: It's not worth the time at this moment to figure out the type when typing with D3 area already so ridiculous.
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
