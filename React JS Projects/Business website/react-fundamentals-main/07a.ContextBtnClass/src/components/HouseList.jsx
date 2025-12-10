import { use } from "react";
import loadingStatus from "../helpers/loadingStatus";
import useHouses from "../hooks/useHouses";
import ErrorBoundary from "./ErrorBoundary";
import HouseRow from "./HouseRow";
import LoadingIndicator from "./LoadingIndicator";
import themeContext from "../helpers/themeContext";

const HouseList = () => {
  const { houses, setHouses, loadingState } = useHouses();
  const { btnClass } = use(themeContext);

  if (loadingState !== loadingStatus.loaded)
    return <LoadingIndicator loadingState={loadingState} />

  const addHouse = () => {
    setHouses([
      ...houses,
      {
        id: 6,
        address: "32 Valley Way, New York",
        country: "USA",
        price: 1000000,
      },
    ]);
  };

  return (
    <>
      <div className="row mb-2">
        <h5 className="themeFontColor text-center">
          Houses currently on the market
        </h5>
      </div>
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Address</th>
            <th>Country</th>
            <th>Asking Price</th>
          </tr>
        </thead>
        <tbody>
          <themeContext.Provider value={{ btnClass: "btn-primary" }}>
            <ErrorBoundary fallback="Error loading house rows!">
              {houses.map((h) => (
                <HouseRow key={h.id} house={h} />
              ))}
            </ErrorBoundary>
          </themeContext.Provider>
        </tbody>
      </table>
      <button onClick={addHouse} className={`btn ${btnClass}`}>
        Add
      </button>
    </>
  );
};

export default HouseList;
