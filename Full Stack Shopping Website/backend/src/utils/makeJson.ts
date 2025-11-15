import {Model, ModelStatic} from "sequelize";
import {getCustomerMultivalued, getDiscountMultivalued, getProductMultivalued, getTagMultivalued, getTransactionMultivalued} from "./getMultivalued";
import BusinessOwner from "../models/BusinessOwner";
import Card from "../models/Card";
import Customer from "../models/Customer";
import Discount from "../models/Discount";
import Product from "../models/Product";
import Shop from "../models/Shop";
import Transaction from "../models/Transaction";
import Tag from "models/Tag";

export type JsonFunc<T extends Model> = (arg0: T) => (Promise<Record<string, any>> | Record<string, any>);

/**
 * Returns an object in the form expected by the frontend.
 * @param object the object about to be sent to the frontend
 * @param objectClass the model type of the given object (e.g. BusinessOwner, Customer, Product, ...)
 * @param extraFields fields that aren't in the given object's Model to be added to the output object
 * @returns the given object, repackaged for use by the frontend
 * @throws error if given object is not an instance of given objectClass
 */
export function getObjectJson<T extends Model>(object: T, objectClass: ModelStatic<T>, extraFields: Record<string, any>): Record<string, any>
{
	if (!(object instanceof objectClass))
	{/*I don't think this is reachable; it was originally necessary since I didn't know about the ModelStatic type, so objectClass was of type any*/
		throw new Error("Argument mismatch between object and objectClass");
	}

	let output: Record<string, any> = {};

	for (let key in objectClass.getAttributes())
	{
		if (key === "password" || key === "createdAt" || key === "updatedAt")
		{continue;}
		else
		{
			output[key] = object.getDataValue(key);
		}
	}
	for (const [key, value] of Object.entries(extraFields))
	{
		output[key] = value;
	}

	return output;
}

/**
 * Returns a BusinessOwner in the form expected by the frontend.
 * @param businessOwner the BusinessOwner about to be sent to the frontend
 * @returns the given BusinessOwner, repackaged for use by the frontend
 */
export function getBusinessOwnerJson(businessOwner: BusinessOwner): Record<string, any>
{
	return getObjectJson(businessOwner, BusinessOwner, {});
}

/**
 * Returns a Card in the form expected by the frontend.
 * @param card the Card about to be sent to the frontend
 * @returns the given Card, repackaged for use by the frontend
 */
export function getCardJson(card: Card): Record<string, any>
{
	return getObjectJson(card, Card, {});
}

/**
 * Returns a Customer in the form expected by the frontend.
 * @param customer the Customer about to be sent to the frontend
 * @returns the given Customer, repackaged for use by the frontend
 */
export async function getCustomerJson(customer: Customer): Promise<Record<string, any>>
{
	let extraFields: Record<string, any> = await getCustomerMultivalued(customer.getDataValue('id'));
	return getObjectJson(customer, Customer, extraFields);
}

/**
 * Returns a Discount in the form expected by the frontend.
 * @param discount the Discount about to be sent to the frontend
 * @returns the given Discount, repackaged for use by the frontend
 */
export async function getDiscountJson(discount: Discount): Promise<Record<string, any>>
{
	let extraFields: Record<string, any> = await getDiscountMultivalued(discount.getDataValue('id'));
	return getObjectJson(discount, Discount, extraFields);
}

/**
 * Returns a Product in the form expected by the frontend.
 * @param product the Product about to be sent to the frontend
 * @returns the given Product, repackaged for use by the frontend
 */
export async function getProductJson(product: Product): Promise<Record<string, any>>
{
	let extraFields: Record<string, any> = await getProductMultivalued(product.getDataValue('id'));
	return getObjectJson(product, Product, extraFields);
}

/**
 * Returns a Shop in the form expected by the frontend.
 * @param shop the Shop about to be sent to the frontend
 * @returns the given Shop, repackaged for use by the frontend
 */
export async function getShopJson(shop: Shop): Promise<Record<string, any>>
{
	const myId = shop.getDataValue('id');
	const businessOwner = await BusinessOwner.findOne({where: {id: myId}});
	let businessOwnerId: number = -1;
	
	if (businessOwner != null)
	{
		businessOwnerId = businessOwner.getDataValue('id');
	}

	let extraFields: Record<string, any> = {businessOwnerId: businessOwnerId} 
	return getObjectJson(shop, Shop, extraFields);
}

/**
 * Returns a Transaction in the form expected by the frontend.
 * @param transaction the Transaction about to be sent to the frontend
 * @returns the given Transaction, repackaged for use by the frontend
 */
export async function getTransactionJson(transaction: Transaction): Promise<Record<string, any>>
{
	let extraFields: Record<string, any> = await getTransactionMultivalued(transaction.getDataValue('id'));
	return getObjectJson(transaction, Transaction, extraFields);
}

/**
 * Returns a Tag in the form expected by the frontend.
 * @param tag the Tag about to be sent to the frontend
 * @returns the given Tag, repackaged for use by the frontend
 */
export async function getTagJson(tag: Tag): Promise<Record<string, any>>
{
	let extraFields: Record<string, any> = await getTagMultivalued(tag.getDataValue('id'));
	return getObjectJson(tag, Tag, extraFields);
}

/**
 * Returns a list of objects in the form expected by the frontend.
 * @param objects the list of objects about to be sent to the frontend
 * @param myProducts the function used to convert each object in the list to the correct format
 * @returns the given list of objects, repackaged for use by the frontend
 */
export async function getJsonBatch<T extends Model>(objects: T[], getJsonFunc: JsonFunc<T>): Promise<Record<string, any>[]>
{
	const listOfJsons = objects.map(async (object) => await getJsonFunc(object))
	return await Promise.all(listOfJsons);
}