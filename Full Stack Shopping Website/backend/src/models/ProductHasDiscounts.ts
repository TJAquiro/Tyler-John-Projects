import { Model, DataTypes } from "sequelize";
import sequelize from "../db/db";
import Product from "./Product";
import Discount from "./Discount";

class ProductHasDiscounts extends Model {
  public productId!: number;
  public discountId!: number;
}

ProductHasDiscounts.init(
  {
	productId: {
	  type: DataTypes.INTEGER,
	  references: {
		model: Product,
		key: 'id',
	  }
	},
	discountId: {
		type: DataTypes.INTEGER,
		references: {
		  model: Discount,
		  key: 'id',
		}
	  },
  },
  {
	sequelize,
	tableName: "productHasDiscounts",
  }
);

export default ProductHasDiscounts;