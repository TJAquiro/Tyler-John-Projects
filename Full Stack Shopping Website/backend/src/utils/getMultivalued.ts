import Cart from "../models/Cart";
import Transaction from "../models/Transaction";
import CustomerHasDiscounts from "../models/CustomerHasDiscounts";
import ProductHasDiscounts from "../models/ProductHasDiscounts";
import ProductHasTags from "../models/ProductHasTags";
import TransactionHasProducts from "../models/TransactionHasProducts";
import Review from "../models/Review";
import CustomerHasCards from "models/CustomerHasCards";

/**
 * Gets the multivalued attributes of a customer as lists of ids
 * @param customerId the id of the customer to get multivalued attributes for
 * @returns the multivalued attributes of customer with id=[customerId]
 */
export async function getCustomerMultivalued(customerId: number): Promise<{cart: number[], transactionIds: number[], cardInfoIds: number[], discountIds: number[]}>
{
	const myCart = await Cart.findAll({where: {customerId: customerId}});
	const myTransactionIds = await Transaction.findAll({where: {customerId: customerId}});
	const myCardInfoIds = await CustomerHasCards.findAll({where: {customerId: customerId}});
	const myDiscountIds = await CustomerHasDiscounts.findAll({where: {customerId: customerId}});
	
	let cart: number[] = [];
	for (let i = 0; i < myCart.length; i++)
	{
		const currentProductId: number = myCart[i].getDataValue('productId');
		const currentCount: number = myCart[i].getDataValue('count')
		for (let j = 0; j < currentCount; j++)
		{
			cart.push(currentProductId);
		}
	}

	return {cart,
			transactionIds: myTransactionIds.map(transaction => transaction.getDataValue('id')),
			cardInfoIds: myCardInfoIds.map(card => card.getDataValue('cardInfoId')),
			discountIds: myDiscountIds.map(discount => discount.getDataValue('discountId'))};
}

/**
 * Gets the multivalued attributes of a discount as lists of ids
 * @param discountId the id of the discount to get multivalued attributes for
 * @returns the multivalued attributes of discount with id=[discountId]
 */
export async function getDiscountMultivalued(discountId: number): Promise<{productIds: number[]}>
{
	const myProductIds = await ProductHasDiscounts.findAll({where: { discountId: discountId } });
	return {productIds: myProductIds.map(product => product.getDataValue('productId'))};
}

/**
 * Gets the multivalued attributes of a product as lists of ids
 * @param productId the id of the product to get multivalued attributes for
 * @returns the multivalued attributes of product with id=[productId]
 */
export async function getProductMultivalued(productId: number): Promise<{tagIds: number[], reviews: string[]}>
{
	const myTagIds = await ProductHasTags.findAll({attributes: ['tagId'], where: {productId: productId}});
	const myReviews = await Review.findAll({where: {ProductId: productId}});
	
	return {tagIds: myTagIds.map((tag) => tag.getDataValue('tagId')),
			reviews: myReviews.map(review => review.getDataValue('reviewText'))};
}

/**
 * Gets the multivalued attributes of a tag as lists of ids
 * @param tagId the id of the tag to get multivalued attributes for
 * @returns the multivalued attributes of tag with id=[tagId]
 */
export async function getTagMultivalued(tagId: number): Promise<{productIds: number[]}>
{
	const myProductIds = await ProductHasTags.findAll({where: { tagId: tagId } });
	return {productIds: myProductIds.map(product => product.getDataValue('productId'))};
}

/**
 * Gets the multivalued attributes of a transaction as lists of ids
 * @param transactionId the id of the transaction to get multivalued attributes for
 * @returns the multivalued attributes of transaction with id=[transactionId]
 */
export async function getTransactionMultivalued(transactionId: number): Promise<{productIds: number[]}>
{
	const myProductIds = await TransactionHasProducts.findAll({ where: { transactionId: transactionId } });
	
	let productIds: number[] = [];
	for (let i = 0; i < myProductIds.length; i++)
	{
		const currentProductId: number = myProductIds[i].getDataValue('productId');
		const currentCount: number = myProductIds[i].getDataValue('count')
		for (let j = 0; j < currentCount; j++)
		{
			productIds.push(currentProductId);
		}
	}

	return {productIds};
}