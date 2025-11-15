import { Model, DataTypes } from "sequelize";
import sequelize from "../db/db";
import Customer from "./Customer";
import Discount from "./Discount";

class CustomerHasDiscounts extends Model {
  public customerId!: number;
  public discountId!: number;
}

CustomerHasDiscounts.init(
  {
	customerId: {
	  type: DataTypes.INTEGER,
	  references: {
		model: Customer,
		key: 'id',
	  }
	},
	discountId: {
		type: DataTypes.INTEGER,
		references: {
		  model: Discount,
		  key: 'id',
		}
	  },
  },
  {
	sequelize,
	tableName: "customerHasDiscounts",
  }
);

export default CustomerHasDiscounts;