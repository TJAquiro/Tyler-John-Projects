import { Model, DataTypes } from "sequelize";
import sequelize from "../db/db";

class Tag extends Model {
  public id!: number;
  public name!: string;
  public imageUrl!: string;
}

Tag.init(
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
	imageUrl: {
		type: DataTypes.STRING,
	}
  },
  {
	sequelize,
	tableName: "tags",
	initialAutoIncrement: '1'
  }
);

export default Tag;