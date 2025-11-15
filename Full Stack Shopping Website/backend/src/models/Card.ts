import { Model, DataTypes } from "sequelize";
import sequelize from "../db/db";

class Card extends Model {
  public id!: number;
  public cardNumber!: string;
  public securityCode!: string;
  public pin!: string;
  public type!: string;   // debit or credit
  public billingAddress!: string;
  public cardHolder!: string;
  public expirationDate!: Date;
}

Card.init(
  {
	id: {
	  type: DataTypes.INTEGER,
	  primaryKey: true,
	  autoIncrement: true,
	},
	cardNumber: {
	  type: DataTypes.STRING,
	  allowNull: false,
	},
	securityCode: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	pin: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	type: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	billingAddress: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	cardHolder: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	expirationDate: {
		type: DataTypes.DATE,
		allowNull: false,
	}
  },
  {
	sequelize,
	tableName: "cards",
	initialAutoIncrement: '1'
  }
);

export default Card;
