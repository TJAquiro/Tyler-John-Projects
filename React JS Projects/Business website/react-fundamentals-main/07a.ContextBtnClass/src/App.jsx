import Banner from "./components/Banner"
import "./App.css"
import ErrorBoundary from "./components/ErrorBoundary";
import HouseList from "./components/HouseList";
import themeContext from "./helpers/themeContext";

function App() {
  return (
    <ErrorBoundary fallback="Something went wrong!">
      <Banner>
        <div>Providing houses all over the world</div>
      </Banner>
      <themeContext.Provider value={{btnClass: "btn-secondary"}}>
        <HouseList />
      </themeContext.Provider>
    </ErrorBoundary>
  );
}

export default App
