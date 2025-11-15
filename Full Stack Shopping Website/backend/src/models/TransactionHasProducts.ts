import { Model, DataTypes } from "sequelize";
import sequelize from "../db/db";
import Transaction from "./Transaction";
import Product from "./Product";

class TransactionHasProducts extends Model {
  public transactionId!: number;
  public productId!: number;
  public count!: number;
}

TransactionHasProducts.init(
  {
	transactionId: {
	  type: DataTypes.INTEGER,
	  references: {
		model: Transaction,
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
	tableName: "transactionHasProducts",
  }
);

export default TransactionHasProducts;