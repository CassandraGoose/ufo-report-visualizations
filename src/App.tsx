import { useState, useEffect } from "react";
import "./App.css";
import ufo from "./assets/ufo.png";
import { Sighting } from './interfaces';
import ShapesByYearStackedHistogram from './ShapesByYearStackedHistogram.tsx';

function App() {
  const [loading, setLoading] = useState(true);
  const [ufoData, setUfoData] = useState<Sighting[]>([]);

  useEffect(() => {
    const getData = async () => {
      const response = await fetch("./byYearsOfShapes.json");
      const data = await response.json();
      setUfoData(data);
    };

    getData();
    setTimeout(() => setLoading(false), 3000);
  }, []);

  return (
    <>
    {!loading && <div className="introduction"><h1>Greetings! This app is SUPER under construction.</h1><p>Honestly, it's more of a playground than anything. Feel free to poke around, but please note that I'm using this as a way to learn and not concerning myself with certain aspects of development that would normally require more attention! Things will be broken at this time.</p></div>}
      <div className="ufo-container">
        {loading && (
          <img className="ufo" src={ufo} alt="line art icon of ufo" />
        )}
        {!loading && <ShapesByYearStackedHistogram ufoData={ufoData} />}
      </div>
    </>
  );
}

export default App;
