import { useState, useEffect } from "react";
import "./App.css";
import ufo from "./assets/ufo.png";
import { Sighting } from "./interfaces";
import ShapesByYearStackedHistogram from "./ShapesByYearStackedHistogram.tsx";
import TopSightingsByCountCity from "./TopSightingsByCountCity.tsx";

function App() {
  const [loading, setLoading] = useState(true);
  const [shapesByYearData, setShapesByYearData] = useState<Sighting[]>([]);
  const [topSightingsCountByCityData, setStopSightingsCountByCityData] = useState<{ city: string, count: number }[]>([]);

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
      {!loading && (
        <div className="introduction flex-col">
          <h1>Greetings! This app is SUPER under construction.</h1>
          <p>
            Honestly, it's more of a playground than anything. Feel free to poke
            around, but please note that I'm using this as a way to learn and
            not concerning myself with certain aspects of development that would
            normally require more attention! Things will be broken at this time.
          </p>
        </div>
      )}
      <div className={`animation-container ${loading ? "" : "hidden"}`}>
        {loading && (
          <img className="ufo" src={ufo} alt="line art icon of ufo" />
        )}
      </div>
      {!loading && <ShapesByYearStackedHistogram ufoData={shapesByYearData} />}
      {!loading && <TopSightingsByCountCity ufoData={topSightingsCountByCityData} />}
    </>
  );
}

export default App;
