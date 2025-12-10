import Banner from "./components/Banner"
import "./App.css"
import HouseList from "./components/HouseList";
import House from "./components/House";
import { useState } from "react";

function App() {
  const [selectedHouse, setSelectedHouse] = useState();

  const setSelectedHouseWrapper = (house) => {
    //do checks on house
    setSelectedHouse(house);
  };

  return (
    <>
      <Banner>
        <div>Providing houses all over the world</div>
      </Banner>
      {selectedHouse ? <House house={selectedHouse} />
        : <HouseList selectHouse={setSelectedHouseWrapper} />}
    </>
  );
}

export default App
