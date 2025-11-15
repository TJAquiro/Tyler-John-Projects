import express, { Request, Response } from "express";
import Discount from "../models/Discount";
import {handleRequest} from "../utils/handleErrors";
import {getDiscountJson} from "../utils/makeJson";
import { updateDiscount, updateManyToMany } from "utils/update";
import { getObjectById } from "utils/getObjectById";
import ProductHasDiscounts from "models/ProductHasDiscounts";
import { deleteObject } from "utils/delete";
import { getAll } from "utils/getBatch";
import { parseIntOrThrow } from "utils/throwers";

const router = express.Router();

// get Discount by ID
router.get("/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await getObjectById(Discount, getDiscountJson, parseIntOrThrow(req.params["id"]), res);
	}, res, "discountRoutes -> get Discount by ID");
});

// POST create a new Discount
/*required fields in request (ignores others):
name: string
description: string
percentOff: number*/
router.post("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		const { name, description, percentOff } = req.body;
		const discount = await Discount.create({ name, description, percentOff });
		res.status(201).json(await getDiscountJson(discount));
	}, res, "discountRoutes -> create a new Discount");
});

//PUT update an existing Discount
/*required fields in request (ignores others):
name: string
description: string
percentOff: number*/
router.put("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await updateDiscount(req, res);
	}, res, "discountRoutes -> update an existing Discount");
});

// PUT update discount products
/*required fields in request (ignores others):
productIds: number[]*/
router.put("/:id/productIds", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await updateManyToMany(ProductHasDiscounts, "discountId", "productId", req, res);
	}, res, "discountRoutes -> update discount products");
});

// DELETE discount by ID
router.delete("/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await deleteObject(Discount, getDiscountJson, req, res);
	}, res, "discountRoutes -> delete discount by id")
});

// get all Discounts
router.get("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		getAll(Discount, getDiscountJson, res);
	}, res, "discountRoutes -> get all Discounts");
});

export default router;
