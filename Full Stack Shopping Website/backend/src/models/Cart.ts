import { Model, DataTypes } from "sequelize";
import sequelize from "../db/db";
import Customer from "./Customer";
import Product from "./Product";

class Cart extends Model {
  public customerId!: number;
  public productId!: number;
  public count!: number;
}

Cart.init(
  {
	customerId: {
	  type: DataTypes.INTEGER,
	  references: {
		model: Customer,
		key: 'id',
	  }
	},
	productId: {
		type: DataTypes.INTEGER,
		references: {
		  model: Product,
		  key: 'id',
		}
	},
	count: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 1,
	}
  },
  {
	sequelize,
	tableName: "cart",
  }
);

export default Cart;