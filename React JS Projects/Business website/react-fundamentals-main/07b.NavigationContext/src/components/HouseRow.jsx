import { useContext } from "react";
import currencyFormatter from "../helpers/currencyFormatter";
import navigationContext from "../navigation/navigationContext";
import navValues from "../navigation/navValues";

const HouseRow = ({ house }) => {
  //uncomment to test error boundary
  //throw new Error();
  const { navigate } = useContext(navigationContext);
  return (
    <tr onClick={() => navigate(navValues.house, house)}>
      <td>{house.address}</td>
      <td>{house.country}</td>
      {house.price && (
        <td className={`${house.price >= 500000 ? "text-primary" : ""}`}>
          {currencyFormatter.format(house.price)}
        </td>
      )}
    </tr>
  );
};

export default HouseRow;