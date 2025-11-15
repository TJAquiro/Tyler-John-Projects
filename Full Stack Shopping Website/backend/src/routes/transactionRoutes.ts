import express, { Request, Response } from "express";
import Transaction from "../models/Transaction";
import TransactionHasProducts from "../models/TransactionHasProducts";
import {handleRequest} from "../utils/handleErrors";
import { getTransactionJson} from "../utils/makeJson"
import {updateTransaction} from "utils/update";
import Product from "models/Product";
import { getObjectById } from "utils/getObjectById";
import { getAll, getBatchByShopId, getManyToManyBatch } from "utils/getBatch";
import { deleteObject } from "utils/delete";
import { parseIntOrThrow, throwIfWrongListType } from "utils/throwers";
import { Op } from "sequelize";

const router = express.Router();

// get Transaction by ID
router.get("/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await getObjectById(Transaction, getTransactionJson, parseIntOrThrow(req.params["id"]), res);
	}, res, "transactionRoutes -> get Transaction by ID");
});

// POST create a new Transaction
/*required fields in request (ignores others):
purchaseDate: Date
shippingAddress: string
status: string
isReturn: boolean
shopId: number
cardInfoId: number
customerId: number
totalPrice: number [will remove this eventually since totalPrice will be derived]
productIds: number[]*/
router.post("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		const { shippingAddress, status, isReturn, shopId, cardInfoId, customerId, totalPrice, productIds } = req.body;
		
		throwIfWrongListType(productIds, "productIds", "number");

		const purchaseDate = new Date();

		const transaction = await Transaction.create({ purchaseDate, shippingAddress, status, isReturn, totalPrice, shopId, cardInfoId, customerId });
		const newTransactionId = transaction.getDataValue('id');
		
		try
		{
			for (let i = 0; i < productIds.length; i++)
			{
				let existingProduct = await TransactionHasProducts.findOne({where: {transactionId: newTransactionId, productId: productIds[i]}});
				if (existingProduct == null)
				{
					existingProduct = await TransactionHasProducts.create({transactionId: newTransactionId, productId: productIds[i]});
				}
				else
				{
					await existingProduct.increment('count');
				}
			}
		}
		catch (error)
		{
			await TransactionHasProducts.destroy({
				where: {
					transactionId: newTransactionId
				}
			});
			await transaction.destroy();
			throw error;
		}

		const purchasedProducts = await TransactionHasProducts.findAll({
			where: {
				transactionId: newTransactionId
			}
		});
		const purchasedProductIds = purchasedProducts.map(row => row.getDataValue('productId'));
		const purchasedProductCounts = purchasedProducts.map(row => row.getDataValue('count'));

		for (let i = 0; i < purchasedProducts.length; i++)
		{
			await Product.decrement('amountInStock', {
				where: {
					id: purchasedProductIds[i]
				},
				by: purchasedProductCounts[i]
			});
		}

		res.status(201).json(await getTransactionJson(transaction));
	}, res, "transactionRoutes -> create a new Transaction");
});

//PUT update an existing Transaction
/*required fields in request (ignores others):
purchaseDate: Date
shippingAddress: string
status: string
isReturn: boolean
shopId: number
cardInfoId: number
customerId: number
totalPrice: number [will remove this eventually since totalPrice will be derived]*/
router.put("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await updateTransaction(req, res);
	}, res, "transactionRoutes -> update an existing Transaction");
});

// get Transactions by Product ID
router.get("/productId/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await getManyToManyBatch(Transaction, "transactionId", TransactionHasProducts, "productId", parseIntOrThrow(req.params["id"]), getTransactionJson, res);
	}, res, "transactionRoutes -> get Transactions by Product ID");
});

// get Transactions by Shop ID
router.get("/shopId/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await getBatchByShopId(Transaction, getTransactionJson, parseIntOrThrow(req.params["id"]), res);
	}, res, "transctionRoutes -> get Transactions by Shop ID");
});

// get Transactions by Customer ID
router.get("/customerId/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		const customerId = parseIntOrThrow(req.params["id"]);
		const transactions = await Transaction.findAll({
			where: {
				customerId: customerId
			}
		});
		const transactionJsons = transactions.map(transaction => getTransactionJson(transaction));
		const transactionJsonsResolved = await Promise.all(transactionJsons);
		res.json(transactionJsonsResolved);
	}, res, "transctionRoutes -> get Transactions by Customer ID");
});

// DELETE transaction by ID
router.delete("/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await deleteObject(Transaction, getTransactionJson, req, res);
	}, res, "transactionRoutes -> delete transaction by id")
});

// get all Transactions
router.get("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		getAll(Transaction, getTransactionJson, res);
	}, res, "transactionRoutes -> get all Transactions");
});

export default router;
