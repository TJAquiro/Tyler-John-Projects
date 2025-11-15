import { Model, DataTypes } from "sequelize";
import sequelize from "../db/db";

class Shop extends Model {
  public id!: number;
  public name!: string;
  public logoImageUrl!: string;
}

Shop.init(
  {
	id: {
	  type: DataTypes.INTEGER,
	  primaryKey: true,
	  autoIncrement: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	logoImageUrl: {
		type: DataTypes.STRING,
		allowNull: true
	}
  },
  {
	sequelize,
	tableName: "shops",
	initialAutoIncrement: '1'
  }
);

export default Shop;