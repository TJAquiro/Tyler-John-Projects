import { Model, DataTypes } from "sequelize";
import sequelize from "../db/db";

class Transaction extends Model {
  public id!: number;
  public purchaseDate!: Date;
  public shippingAddress!: string;
  public status!: string;
  public isReturn!: boolean;
}

Transaction.init(
  {
	id: {
	  type: DataTypes.INTEGER,
	  primaryKey: true,
	  autoIncrement: true,
	},
	purchaseDate: {
		type: DataTypes.DATE,
		allowNull: false
	},
	shippingAddress: {
	  type: DataTypes.STRING,
	  allowNull: false,
	},
	status: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	isReturn: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
	},
	totalPrice: {
		type: DataTypes.FLOAT,
		allowNull: false
	}
  },
  {
	sequelize,
	tableName: "transactions",
	initialAutoIncrement: '1'
  }
);

export default Transaction;