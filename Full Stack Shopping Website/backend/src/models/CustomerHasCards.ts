import { Model, DataTypes } from "sequelize";
import sequelize from "../db/db";
import Customer from "./Customer";
import Card from "./Card";

class CustomerHasCards extends Model {
  public customerId!: number;
  public cardId!: number;
}

CustomerHasCards.init(
  {
	customerId: {
	  type: DataTypes.INTEGER,
	  references: {
		model: Customer,
		key: 'id',
	  }
	},
	cardInfoId: {
		type: DataTypes.INTEGER,
		references: {
		  model: Card,
		  key: 'id',
		}
	  },
  },
  {
	sequelize,
	tableName: "customerHasCards",
  }
);

export default CustomerHasCards;