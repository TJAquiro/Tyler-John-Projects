import express, { Request, Response } from "express";
import Customer from "../models/Customer";
import Cart from "../models/Cart";
import {handleRequest} from "../utils/handleErrors";
import {getPasswordHash} from "../utils/auth";
import {getCustomerJson} from "../utils/makeJson";
import {findUsername, getUserByUsernameHandler} from "../utils/findUsername";
import {updateCustomer, updateManyToMany} from "utils/update";
import { getObjectById } from "utils/getObjectById";
import CustomerHasCards from "models/CustomerHasCards";
import CustomerHasDiscounts from "models/CustomerHasDiscounts";
import { deleteObject } from "utils/delete";
import { getAll, getBatchByShopId } from "utils/getBatch";
import { parseIntOrThrow } from "utils/throwers";

const router = express.Router();

// get customer by ID
router.get("/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await getObjectById(Customer, getCustomerJson, parseIntOrThrow(req.params["id"]), res);
	}, res, "customerRoutes -> get customer by ID");
});

// GET Customer by username
router.get("/getByUsername/:username", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await getUserByUsernameHandler(Customer, req, res, getCustomerJson);
	}, res, "customerRoutes -> get Customer by username");
});

// POST create a new customer
/*required fields in request (ignores others):
firstName: string
lastName: string
username: string
password: string
shopId: number*/
router.post("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		const { firstName, lastName, username, password, shopId } = req.body;
		if (await findUsername(username) == -1)
		{
			const hashedPassword = getPasswordHash(password);
			const customer = await Customer.create({ firstName: firstName, lastName: lastName, username: username, password: hashedPassword, shopId });

			res.status(201).json(await getCustomerJson(customer));
		}
		else
		{
			throw new Error("Username '" + username + "' already exists");
		}
	}, res, "customerRoutes -> create a new customer");
});

//PUT update an existing Customer
/*required fields in request (ignores others):
firstName: string
lastName: string
username: string
password: string
shopId: number*/
router.put("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await updateCustomer(req, res);
	}, res, "customerRoutes -> update an existing Customer");
});

// POST add product IDs to cart
// USE UPDATE CART INSTEAD
/*required fields in request (ignores others):
productIds: number[]*/
router.post("/:id/cart", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		const customerId = parseIntOrThrow(req.params["id"]);
		const { productIds } = req.body;
		if (!Array.isArray(productIds))
		{
			throw new Error("Request must contain field 'productIds' which is a list of integers.");
		}
		
		for (let i = 0; i < productIds.length; i++)
		{
			const existingProduct = await Cart.findOne({where: {customerId: customerId, productId: productIds[i]}});
			if (existingProduct == null)
			{
				await Cart.create({customerId: customerId, productId: productIds[i]});
			}
			else
			{
				existingProduct.increment('count');
			}
		}

		res.status(201).json({customerId: customerId,
								productId: productIds});
	}, res, "customerRoutes -> add product IDs to cart");
});

// PUT update cart
/*required fields in request (ignores others):
productIds: number[]*/
router.put("/:id/cart", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await updateManyToMany(Cart, "customerId", "productId", req, res);
	}, res, "customerRoutes -> update cart");
});

// PUT update customer cards
/*required fields in request (ignores others):
cardInfoIds: number[]*/
router.put("/:id/cardInfoIds", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await updateManyToMany(CustomerHasCards, "customerId", "cardInfoId", req, res);
	}, res, "customerRoutes -> update customer cards");
});

// PUT update customer discounts
/*required fields in request (ignores others):
discountIds: number[]*/
router.put("/:id/discountIds", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await updateManyToMany(CustomerHasDiscounts, "customerId", "discountId", req, res);
	}, res, "customerRoutes -> update customer discounts");
});

// DELETE customer by ID
router.delete("/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await deleteObject(Customer, getCustomerJson, req, res);
	}, res, "customerRoutes -> delete customer by id")
});

// get Customers by Shop ID
router.get("/shopId/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await getBatchByShopId(Customer, getCustomerJson, parseIntOrThrow(req.params["id"]), res);
	}, res, "customerRoutes -> get Customers by Shop ID");
});

// get all customers
router.get("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		getAll(Customer, getCustomerJson, res);
	}, res, "customerRoutes -> get all customers");
});

export default router;
