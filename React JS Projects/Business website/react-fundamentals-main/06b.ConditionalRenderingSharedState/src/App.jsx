import Banner from "./components/Banner"
import "./App.css"
import HouseList from "./components/HouseList";
import House from "./components/House";
import { useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const [selectedHouse, setSelectedHouse] = useState();

  const setSelectedHouseWrapper = (house) => {
    //do checks on house
    setSelectedHouse(house);
  };

  return (
    <ErrorBoundary fallback="Something went wrong!">
      <Banner>
        <div>Providing houses all over the world</div>
      </Banner>
        {selectedHouse ? (
          <House house={selectedHouse} />
        ) : (
          <HouseList selectHouse={setSelectedHouseWrapper} />
        )}
    </ErrorBoundary>
  );
}

export default App
