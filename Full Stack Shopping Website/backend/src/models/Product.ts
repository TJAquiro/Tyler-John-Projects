import { Model, DataTypes } from "sequelize";
import sequelize from "../db/db";

class Product extends Model {
  public id!: number;
  public name!: string;
  public description!: string;
  public price!: number;
  public amountInStock!: number;
  public imageUrl!: string;
  public listed!: boolean;
}

Product.init(
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
	price: {
	  type: DataTypes.FLOAT,
	  allowNull: false
	},
	amountInStock: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	imageUrl: {
		type:DataTypes.STRING,
	},
	listed: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	}
  },
  {
	sequelize,
	tableName: "products",
	initialAutoIncrement: '1'
  }
);

export default Product;
