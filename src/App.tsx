import { useState, useEffect } from "react";
import "./App.css";
import ufo from "./assets/ufo.png";
import { Sighting } from "./interfaces";
import ShapesByYearStackedHistogram from "./Charts/ShapesByYearStackedHistogram.tsx";
import TopSightingsByCountCityHorizontalBar from "./Charts/TopSightingsByCountCityHorizontalBar.tsx";
import ChartCard from "./Components/ChartCard.tsx";
import ShapesIn2023Pie from "./Charts/ShapesIn2023Pie.tsx";
import * as d3 from "d3";

const MARGIN = { top: 50, right: 50, bottom: 60, left: 80 };

function App() {
  const [loading, setLoading] = useState(true);
  const [shapesByYearData, setShapesByYearData] = useState<Sighting[]>([]);
  const [topSightingsCountByCityData, setStopSightingsCountByCityData] =
    useState<{ city: string; count: number }[]>([]);
  const [shapesIn2023Data, setShapesIn2023Data] = useState<{[shape:string]: number}[]>([]);
  const { innerWidth: width, innerHeight: height } = window;
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  const colors = d3.interpolateRainbow;

  const scaleFactor = Math.min(boundsWidth / width, boundsHeight / height);

  const scaledMargin = {
    top: MARGIN.top * scaleFactor,
    right: MARGIN.right * scaleFactor,
    bottom: MARGIN.bottom * scaleFactor,
    left: MARGIN.left * scaleFactor,
  };

  useEffect(() => {
    //todo make this dry
    const getData = async () => {
      const shapesResponse = await fetch("./shapesByYear.json");
      const shapesData = await shapesResponse.json();
      setShapesByYearData(shapesData);

      const topCountsResponse = await fetch("./topSightingsCountByCity.json");
      const topCountsData = await topCountsResponse.json();
      setStopSightingsCountByCityData(topCountsData);

      const shapesIn2023Response = await fetch(
        "./2023UfoShapes.json"
      );
      const shapes2023Data = await shapesIn2023Response.json();
      setShapesIn2023Data(shapes2023Data);
    };

    getData();
    setTimeout(() => setLoading(false), 3000);
  }, []);

  return (
    <>
      <div className={`animation-container ${loading ? "" : "hidden"}`}>
        {loading && (
          <img className="ufo" src={ufo} alt="line art icon of ufo" />
        )}
      </div>
      {!loading && (
        <div className="nav flex-row white-space-padding">
          <h1 className="font-important title">
            Reported UFO Sightings Visualized
          </h1>
        </div>
      )}
      {!loading && (
        <div className="content white-space-padding">
          <p>
            This app utilizes data from the National UFO Reporting Center Online
            Database. We do our best to appropriately clean data, but due to the
            nature of reporting, some data may be unintentionally skewed due to
            how people fill out the form. Be advised that accessibility may be
            limited at this time, as I relearn D3. I want to fix it ASAP!
          </p>

          <ChartCard>
            <ShapesByYearStackedHistogram
              ufoData={shapesByYearData}
              boundsWidth={boundsWidth}
              boundsHeight={boundsHeight}
              MARGIN={scaledMargin}
              colors={colors}
            />
          </ChartCard>

          <ChartCard>
            <TopSightingsByCountCityHorizontalBar
              ufoData={topSightingsCountByCityData}
              boundsWidth={boundsWidth}
              boundsHeight={boundsHeight}
              MARGIN={scaledMargin}
              colors={colors}
            />
          </ChartCard>

          <ChartCard>
            <ShapesIn2023Pie
              ufoData={shapesIn2023Data}
              boundsWidth={boundsWidth}
              boundsHeight={boundsHeight}
              MARGIN={scaledMargin}
              colors={colors}
            />
          </ChartCard>
        </div>
      )}
    </>
  );
}

export default App;
