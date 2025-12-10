import currencyFormatter from "../helpers/currencyFormatter";

const HouseRow = ({ house, selectHouse }) => {
  //uncomment to test error boundary
  //throw new Error();
  return (
      <tr onClick={() => selectHouse(house)}>
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