import { Model, DataTypes } from "sequelize";
import sequelize from "../db/db";

class Discount extends Model {
	public id!: number;
    public name!: string;
    public description!: string;
	public percentOff!: number;
}

Discount.init(
  {
	id: {
	  type: DataTypes.INTEGER,
	  primaryKey: true,
	  autoIncrement: true,
	},
	name: {
	  type: DataTypes.STRING,
	  allowNull: false,
	  unique: true
	},
	description: {
		type:DataTypes.STRING,
		allowNull: false,
	},
	percentOff: {
		type: DataTypes.FLOAT,
		allowNull: false
	},
  },
  {
	sequelize,
	tableName: "discounts",
	initialAutoIncrement: '1'
  }
);

export default Discount;
