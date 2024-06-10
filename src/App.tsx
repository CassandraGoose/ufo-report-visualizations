import { useState, useEffect } from "react";
import "./App.css";
import ufo from "./assets/ufo.png";
import { Sighting } from "./interfaces";
import ShapesByYearStackedHistogram from "./ShapesByYearStackedHistogram.tsx";
import TopSightingsByCountCity from "./TopSightingsByCountCity.tsx";
import ChartCard from "./ChartCard.tsx";

const MARGIN = { top: 50, right: 50, bottom: 60, left: 80 };

function App() {
  const [loading, setLoading] = useState(true);
  const [shapesByYearData, setShapesByYearData] = useState<Sighting[]>([]);
  const [topSightingsCountByCityData, setStopSightingsCountByCityData] =
    useState<{ city: string; count: number }[]>([]);
  const { innerWidth: width, innerHeight: height } = window;
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const scaleFactor = Math.min(boundsWidth / width, boundsHeight / height);

  // Adjust MARGIN based on scaleFactor
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
          <h1 className="font-important title">Reported UFO Sightings Visualized</h1>
        </div>
      )}
      {!loading && (
        <div className="content white-space-padding">
          <p>
            This app utilizes data from the National UFO Reporting Center Online
            Database. We do our best to appropriately clean data, but due to the
            nature of reporting, some data may be unintentionally skewed due to
            how people fill out the form. Be advised that accessibility may be limited at this time, as I relearn D3. I want to fix it ASAP!
          </p>

          <ChartCard>
            <ShapesByYearStackedHistogram
              ufoData={shapesByYearData}
              boundsWidth={boundsWidth}
              boundsHeight={boundsHeight}
              MARGIN={scaledMargin}
            />
          </ChartCard>

          <ChartCard>
            <TopSightingsByCountCity
              ufoData={topSightingsCountByCityData}
              boundsWidth={boundsWidth}
              boundsHeight={boundsHeight}
              MARGIN={scaledMargin}
            />
          </ChartCard>
        </div>
      )}
    </>
  );
}

export default App;
