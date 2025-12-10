import Banner from "./components/Banner"
import "./App.css"
import HouseList from "./components/HouseList";
import { Suspense } from "react";

function App() {
  return (
    <>
      <Banner>
        <div>Providing houses all over the world</div>
      </Banner>
      <Suspense fallback={<h3>Loading...</h3>}>
        <HouseList />
      </Suspense>
    </>
  );
}

export default App
