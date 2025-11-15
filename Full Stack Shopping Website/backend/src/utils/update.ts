import {Model, ModelStatic, WhereOptions} from "sequelize";
import {Request, Response} from "express";
import {getBusinessOwnerJson, getCustomerJson, getCardJson, getDiscountJson, getProductJson, getShopJson, getTransactionJson, getTagJson} from "./makeJson";
import {findUsername} from "./findUsername";
import BusinessOwner from "../models/BusinessOwner";
import Customer from "../models/Customer";
import Card from "../models/Card";
import Discount from "../models/Discount";
import Product from "../models/Product";
import Shop from "../models/Shop";
import Transaction from "../models/Transaction";
import { MakeNullishOptional } from "sequelize/types/utils";
import Tag from "models/Tag";
import { throwIfUndefined, throwIfWrongListType } from "./throwers";

/**
 * Updates any/all fields of an object in the database
 * @param objectClass the class of the object to be updated (e.g. Product, Customer, Transaction, ...)
 * @param req the request sent to the server
 * @param res the response to be sent by the server
 * @throws error if req[attribute] is absent for any attribute in T.getAttributes() (excludes createdAt, updatedAt, and password)
 * @throws error if the ID contained in the request doesn't correspond to any T.ID in the database
 * @throws error if the update would cause two different users to have the same username
 */
export async function updateObject<T extends Model>(objectClass: ModelStatic<T>, req: Request): Promise<T>
{
	let input: Record<string, any> = {};
	for (let key in objectClass.getAttributes())
	{
		if (key === "createdAt" || key === "updatedAt" || key === "password") {continue;}
		throwIfUndefined(req.body[key], "Request body must contain '" + key + "' field.");

		input[key] = req.body[key];
	}

	const match = await objectClass.findByPk(input["id"]);
	if (match == null)
	{
		throw new Error("Can't update, ID #" + input["id"] + " not found.");
	}

	if (!(typeof input["username"] == 'undefined'))
	{
		const userId = await findUsername(input["username"]);
		if (userId != input["id"] && userId != -1)
		{
			throw new Error("Can't update, username '" + input["username"] + "' is already taken.");
		}
	}

	const newObject = await match.update(input);
	return newObject;
}

/**
 * Updates any/all fields of a BusinessOwner in the database
 * @param req the request sent to the server
 * @param res the response to be sent by the server 
 */
export async function updateBusinessOwner(req: Request, res: Response) : Promise<void>
{
	let newBusinessOwner = await updateObject(BusinessOwner, req);
	res.status(201).json(getBusinessOwnerJson(newBusinessOwner));
}

/**
 * Updates any/all fields of a Customer in the database
 * @param req the request sent to the server
 * @param res the response to be sent by the server 
 */
export async function updateCustomer(req: Request, res: Response) : Promise<void>
{
	const newCustomer = await updateObject(Customer, req);
	res.status(201).json(getCustomerJson(newCustomer));
}

/**
 * Updates any/all fields of a Card in the database
 * @param req the request sent to the server
 * @param res the response to be sent by the server 
 */
export async function updateCard(req: Request, res: Response) : Promise<void>
{
	const newCard = await updateObject(Card, req);
	res.status(201).json(getCardJson(newCard));
}

/**
 * Updates any/all fields of a Discount in the database
 * @param req the request sent to the server
 * @param res the response to be sent by the server 
 */
export async function updateDiscount(req: Request, res: Response) : Promise<void>
{
	const newDiscount = await updateObject(Discount, req);
	res.status(201).json(getDiscountJson(newDiscount));
}

/**
 * Updates any/all fields of a Product in the database
 * @param req the request sent to the server
 * @param res the response to be sent by the server 
 */
export async function updateProduct(req: Request, res: Response) : Promise<void>
{
	const newProduct = await updateObject(Product, req);
	res.status(201).json(getProductJson(newProduct));
}

/**
 * Updates any/all fields of a Shop in the database
 * @param req the request sent to the server
 * @param res the response to be sent by the server 
 */
export async function updateShop(req: Request, res: Response) : Promise<void>
{
	const newShop = await updateObject(Shop, req);
	res.status(201).json(await getShopJson(newShop));
}

/**
 * Updates any/all fields of a Transaction in the database
 * @param req the request sent to the server
 * @param res the response to be sent by the server 
 */
export async function updateTransaction(req: Request, res: Response) : Promise<void>
{
	const newTransaction = await updateObject(Transaction, req);
	res.status(201).json(getTransactionJson(newTransaction));
}

/**
 * Updates any/all fields of a Tag in the database
 * @param req the request sent to the server
 * @param res the response to be sent by the server 
 */
export async function updateTag(req: Request, res: Response) : Promise<void>
{
	const newTag = await updateObject(Tag, req);
	res.status(201).json(getTagJson(newTag));
}

/**
 * Updates entries in a many-to-many join table.
 * 
 * "origin" refers to the object whose multivalued attribute is being modified
 * 
 * "target" refers to the object paired with origin in joinTable
 * 
 * e.g. when updating a customer's cart, Customer is the origin and Product is the target
 * 
 * Example call for updating cart: updateManyToMany(Cart, "customerId", "productId", true, req, res);
 * 
 * @param joinTable join table defining a many-to-many relationship
 * @param originFKName name of the origin foreign key in the join table
 * @param targetFKName name of the target foreign key in the join table
 * @param req the request sent by the frontend, must contain an "id" field in req.params and a list named the plural of targetFKName in req.body
 * @param res the response to be sent to the frontend
 * @throws error if no list is present in req.body or if list has the wrong name
 */
export async function updateManyToMany<T extends Model>(joinTable: ModelStatic<T>,
														originFKName: string,
														targetFKName: string,
														req: Request,
														res: Response) : Promise<void>
{
	const targetFKListName = targetFKName + "s";
	const originId = parseInt(req.params["id"]);
	const targetIds = req.body[targetFKListName];
	
	throwIfWrongListType(targetIds, targetFKListName, "number");

	let hasCount: boolean = tableHasCount(joinTable);
	
	// I decided to "update" by deleting the entire multivalued attribute, then loading in the new values
	// not optimal in terms of time, but very simple
	await joinTable.destroy({
		where: {
			[originFKName]: originId
		} as WhereOptions
	});
	
	for (let i = 0; i < targetIds.length; i++)
	{
		const existingValue = await joinTable.findOne({
			where: {
				[originFKName]: originId, [targetFKName]: targetIds[i]
			} as WhereOptions
		});

		if (existingValue == null)
		{
			await joinTable.create({
				[originFKName]: originId, [targetFKName]: targetIds[i]
			} as MakeNullishOptional<T["_creationAttributes"]>);
		}
		else
		{
			if (hasCount)
			{
				await existingValue.increment('count');
			}
		}
	}

	res.status(201).json({[originFKName]: originId,
							[targetFKListName]: targetIds});
}

function tableHasCount<T extends Model>(table: ModelStatic<T>): boolean
{
	let hasCount: boolean = false;
	for (let attribute in table.getAttributes())
	{
		if (attribute === 'count')
		{
			hasCount = true;
			break;
		}
	}
	return hasCount;
}