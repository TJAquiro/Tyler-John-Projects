import BusinessOwner from "./BusinessOwner";
import Card from "./Card";
import Customer from "./Customer";
import Discount from "./Discount";
import Product from "./Product";
import Review from "./Review";
import Shop from "./Shop";
import Tag from "./Tag";
import Transaction from "./Transaction";
import Cart from "./Cart";
import CustomerHasCards from "./CustomerHasCards";
import CustomerHasDiscounts from "./CustomerHasDiscounts";
import ProductHasDiscounts from "./ProductHasDiscounts";
import ProductHasTags from "./ProductHasTags";
import TransactionHasProducts from "./TransactionHasProducts";

/*
Relationships and location in database:
	- 1-1 between Shop and BusinessOwner
		--> BusinessOwner Model; "shopId" field
	- 1-many between Shop and Customer
		--> Customer Model; "shopId" field
	- 1-many between Shop and Product
		--> Product Model; "shopId" field
	- 1-many between Shop and Transaction
		--> Transaction Model; "shopId" field
	- 1-many between Shop and Tag
		--> Tag Model; "shopId" field
	- many-many between Customer and Product
		--> Junction Model called "Cart"; "customerId" and "productId" fields
	- 1-many between Customer and Transaction
		--> Transaction Model; "customerId" field
	- many-many between Customer and Card
		--> Junction Model called "CustomerHasCards"; "customerId" and "cardInfoId" fields
	- many-many between Customer and Discount
		--> Junction Model called "CustomerHasDiscounts"; "customerId" and "discountId" fields
	- 1-many between Product and Review
		--> Review Model; "productId" field
	- many-many between Product and Tag
		--> Junction Model called "ProductHasTags"; "productId" and "tagId" fields
	- 1-many between Card and Transaction
		--> Transaction Model; "cardInfoId" field
	- many-many between Product and Transaction
		--> Junction Model called "TransactionHasProducts"; "transactionId" and "productId" fields
	- many-many between Discount and Product
		--> Junction Model called "ProductHasDiscounts"; "productId" and "discountId" fields
*/

/*Create 1-1 mandatory relationship between BusinessOwner and Shop*/
function create_ShopBusinessOwner() : void {
	Shop.hasOne(BusinessOwner, {
		foreignKey: {
			name: 'shopId',
			allowNull: false,
		}
	});
	BusinessOwner.belongsTo(Shop, {
		foreignKey: {
			name: 'shopId',
			allowNull: false,
		}
	});
}

/*Create 1-many mandatory relationship between Shop and Customer*/
function create_ShopCustomer() : void {
	Shop.hasMany(Customer, {
		foreignKey: {
			name: 'shopId',
			allowNull: false,
		}
	});
	Customer.belongsTo(Shop, {
		foreignKey: {
			name: 'shopId',
			allowNull: false,
		}
	});
}

/*Create 1-many mandatory relationship between Shop and Tag*/
function create_ShopTag() : void {
	Shop.hasMany(Tag, {
		foreignKey: {
			name: 'shopId',
			allowNull: false,
		}
	});
	Tag.belongsTo(Shop, {
		foreignKey: {
			name: 'shopId',
			allowNull: false,
		}
	});
}

/*Create 1-many mandatory relationship between Shop and Product*/
function create_ShopProduct(): void {
	Shop.hasMany(Product, {
		foreignKey: {
			name: 'shopId',
			allowNull: false,
		}
	});
	Customer.belongsTo(Shop, {
		foreignKey: {
			name: 'shopId',
			allowNull: false,
		}
	});
}

/*Create 1-many mandatory relationship between Shop and Transaction*/
function create_ShopTransaction(): void {
	Shop.hasMany(Transaction, {
		foreignKey: {
			name: 'shopId',
			allowNull: false,
		}
	});
	Customer.belongsTo(Shop, {
		foreignKey: {
			name: 'shopId',
			allowNull: false,
		}
	});
}

/*Create many-many relationship between Customer and Product*/
function create_CustomerProduct(): void {
	Customer.belongsToMany(Product, {through: Cart, foreignKey: 'customerId', otherKey: 'productId'});
	Product.belongsToMany(Customer, {through: Cart, foreignKey: 'productId', otherKey: 'customerId'});
}

/*Create 1-many mandatory relationship between Customer and Transaction*/
function create_CustomerTransaction(): void {
	Customer.hasMany(Transaction, {
		foreignKey: {
			name: 'customerId',
			allowNull: false,
		}
	});
	Transaction.belongsTo(Customer, {
		foreignKey: {
			name: 'customerId',
			allowNull: false,
		}
	});
}

/*Create many-many relationship between Customer and Card*/
function create_CustomerCard(): void {
	Customer.belongsToMany(Card, {through: CustomerHasCards, foreignKey: 'customerId', otherKey: 'cardInfoId'});
	Card.belongsToMany(Customer, {through: CustomerHasCards, foreignKey: 'cardInfoId', otherKey: 'customerId'});
}

/*Create many-many relationship between Customer and Discount*/
function create_CustomerDiscount(): void {
	Customer.belongsToMany(Discount, {through: CustomerHasDiscounts, foreignKey: 'customerId', otherKey: 'discountId'});
	Discount.belongsToMany(Customer, {through: CustomerHasDiscounts, foreignKey: 'discountId', otherKey: 'customerId'});
}

/*Create 1-many mandatory relationship between Product and Review*/
function create_ProductReview(): void {
	Product.hasMany(Review, {
		foreignKey: {
			name: 'productId',
			allowNull: false,
		}
	});
	Review.belongsTo(Product, {
		foreignKey: {
			name: 'productId',
			allowNull: false,
		}
	});
}

/*Create many-many relationship between Product and Tag*/
function create_ProductTag(): void {
	Product.belongsToMany(Tag, {through: ProductHasTags, foreignKey: 'productId', otherKey: 'tagId'});
	Tag.belongsToMany(Product, {through: ProductHasTags, foreignKey: 'tagId', otherKey: 'productId'});
}

/*Create 1-many mandatory relationship between Card and Transaction*/
function create_CardTransaction(): void {
	Card.hasMany(Transaction, {
		foreignKey: {
			name: 'cardInfoId',
			allowNull: false,
		}
	});
	Transaction.belongsTo(Card, {
		foreignKey: {
			name: 'cardInfoId',
			allowNull: false,
		}
	});
}

/*Create many-many relationship between Product and Transaction*/
function create_ProductTransaction(): void {
	Product.belongsToMany(Transaction, {through: TransactionHasProducts, foreignKey: 'productId', otherKey: 'transactionId'});
	Transaction.belongsToMany(Product, {through: TransactionHasProducts, foreignKey: 'transactionId', otherKey: 'productId'});
}

/*Create many-many relationship between Discount and Product*/
function create_DiscountProduct(): void {
	Discount.belongsToMany(Product, {through: ProductHasDiscounts, foreignKey: 'discountId', otherKey: 'productId'});
	Product.belongsToMany(Discount, {through: ProductHasDiscounts, foreignKey: 'productId', otherKey: 'discountId'});
}

/**
 * Tells Sequelize to create relationships between object types.
 * In the case of 1-1 or 1-many relationships, the relation will be stored as a foreign key in one of the Models/tables.
 * In the case of many-many, the relation will be stored as a pair of foreign keys in a junction Model/table.
 * See block comment at the top of this file for details on relations created.
 */
export function createRelations() : void {
	create_ShopBusinessOwner();
	create_ShopTag();
	create_ShopCustomer();
	create_ShopProduct();
	create_ShopTransaction();
	create_CustomerProduct();
	create_CustomerTransaction();
	create_CustomerCard();
	create_CustomerDiscount();
	create_ProductReview();
	create_ProductTag();
	create_CardTransaction();
	create_ProductTransaction();
	create_DiscountProduct();
}