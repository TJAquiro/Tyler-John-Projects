import { Model, DataTypes } from "sequelize";
import sequelize from "../db/db";

class Customer extends Model {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public username!: string;
  public password!: string;
}

Customer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
	firstName: {
		type: DataTypes.STRING,
		allowNull: false
	},
	lastName: {
		type: DataTypes.STRING,
		allowNull: false
	},
    username: {
      type: DataTypes.STRING,
      allowNull: false,
	  unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
  },
  {
    sequelize,
    tableName: "customers",
	initialAutoIncrement: '1'
  }
);

export default Customer;
