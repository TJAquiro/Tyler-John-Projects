import express, { Request, Response } from "express";
import Product from "../models/Product";
import TransactionHasProducts from "../models/TransactionHasProducts";
import {handleRequest} from "../utils/handleErrors";
import { getProductJson } from "../utils/makeJson"
import { updateManyToMany, updateProduct } from "utils/update";
import { getObjectById } from "utils/getObjectById";
import { getAll, getBatchByShopId, getJsonBatchUsingIds, getManyToManyBatch } from "utils/getBatch";
import ProductHasTags from "models/ProductHasTags";
import { deleteObject } from "utils/delete";
import { parseIntOrThrow, throwIfUndefined, throwIfWrongListType } from "utils/throwers";
import Review from "models/Review";

const router = express.Router();

// get Product by ID
router.get("/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await getObjectById(Product, getProductJson, parseIntOrThrow(req.params["id"]), res);
	}, res, "productRoutes -> get Product by ID");
});

// POST create a new product
/*required fields in request (ignores others):
name: string
description: string
price: number
amountInStock: number
imageUrl: string
shopId: number*/
router.post("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		const { name, description, price, amountInStock, imageUrl, shopId } = req.body;
		const product = await Product.create({ name, description, price, amountInStock, imageUrl, shopId });
		res.status(201).json(await getProductJson(product));
	}, res, "productRoutes -> create a new Product");
});

//PUT update an existing Product
/*required fields in request (ignores others):
name: string
description: string
price: number
amountInStock: number
imageUrl: string
listed: boolean
shopId: number*/
router.put("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await updateProduct(req, res);
	}, res, "productRoutes -> update an existing Product");
});

// PUT update product tags
/*required fields in request (ignores others):
tagIds: number[]*/
router.put("/:id/tagIds", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await updateManyToMany(ProductHasTags, "productId", "tagId", req, res);
	}, res, "productRoutes -> update product tags");
});

// PUT update product reviews
/*required fields in request (ignores others):
reviews: string[]*/
router.put("/:id/reviews", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		const productId = parseIntOrThrow(req.params["id"]);
		const {reviews} = req.body;

		throwIfWrongListType(reviews, "reviews", "string");
		// as of this line, reviews is known to be a list of strings, or else throwIfWrongListType would have thrown an error

		await Review.destroy({where: {productId: productId}});

		for (let i = 0; i < reviews.length; i++)
		{
			await Review.create({productId: productId, reviewText: reviews[i]});
		}

		res.status(201).json({productId, reviews});
	}, res, "productRoutes -> update product reviews");
});

// get Products by Transaction ID
router.get("/transactionId/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await getManyToManyBatch(Product, "productId", TransactionHasProducts, "transactionId", parseIntOrThrow(req.params["id"]), getProductJson, res);
	}, res, "productRoutes -> get Products by Transaction ID");
});

// get Products by Shop ID
router.get("/shopId/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await getBatchByShopId(Product, getProductJson, parseIntOrThrow(req.params["id"]), res);
	}, res, "productRoutes -> get Products by Shop ID");
});

// get Products by Tag ID
router.get("/tagId/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await getManyToManyBatch(Product, "productId", ProductHasTags, "tagId", parseIntOrThrow(req.params["id"]), getProductJson, res);
	}, res, "productRoutes -> get Products by Tag ID");
});

// PUT get product objects given a list of product IDs
/*required fields in request (ignores others):
productIds: number[]*/
router.put("/getByIdList", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		const {productIds} = req.body;
		if (!Array.isArray(productIds))
		{
			throw new Error ("Request must contain a field called 'productIds' which is a list of integers");
		}
		res.status(200).json(await getJsonBatchUsingIds(Product, productIds, getProductJson));
	}, res, "productRoutes -> PUT get product objects given a list of product IDs")
});

// DELETE product by ID
router.delete("/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await deleteObject(Product, getProductJson, req, res);
	}, res, "productRoutes -> delete product by id")
});

// get all Products
router.get("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		getAll(Product, getProductJson, res);
	}, res, "productRoutes -> get all Products");
});

export default router;
