import { Model, DataTypes } from "sequelize";
import sequelize from "../db/db";

class Review extends Model {
  public id!: number;
  public reviewText!: string;
}

Review.init(
  {
	id: {
	  type: DataTypes.INTEGER,
	  primaryKey: true,
	  autoIncrement: true,
	},
	reviewText: {
	  type: DataTypes.STRING,
	  allowNull: false,
	}
  },
  {
	sequelize,
	tableName: "reviews",
	initialAutoIncrement: '1'
  }
);

export default Review;