import { useState } from 'react';

import "./App.css";
import ufo from "./assets/ufo.png";

function App() {
  const [loading, setLoading] = useState(true);

  const loadChart = () => {
    setTimeout(() => setLoading(false), 3000);
  }

  loadChart();

  return (
    <>
     <div className="ufo-container">
      {loading && <img className="ufo" src={ufo} alt="line art icon of ufo" />}
      {!loading && <div>chart here!</div>}
     </div>
    </>
  );
}

export default App;
