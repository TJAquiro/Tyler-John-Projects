import Banner from "./components/Banner"
import "./App.css"
import House from "./components/House"
import HouseList from "./components/HouseList";
import { BrowserRouter, Route, Routes } from "react-router"

function App() {
  return (
    <BrowserRouter>
      <Banner>
        <div>Providing houses all over the world</div>
      </Banner>
      <Routes>
        <Route index element={<HouseList />} />
        <Route path="house" element={<House />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
