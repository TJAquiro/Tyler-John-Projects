import { Model, DataTypes } from "sequelize";
import sequelize from "../db/db";
import Product from "./Product";
import Tag from "./Tag";

class ProductHasTags extends Model {
  public productId!: number;
  public tagId!: number;
}

ProductHasTags.init(
  {
	productId: {
	  type: DataTypes.INTEGER,
	  references: {
		model: Product,
		key: 'id',
	  }
	},
	tagId: {
		type: DataTypes.INTEGER,
		references: {
		  model: Tag,
		  key: 'id',
		}
	  },
  },
  {
	sequelize,
	tableName: "productHasTags",
  }
);

export default ProductHasTags;