import express, { Request, Response } from "express";
import Shop from "../models/Shop";
import {handleRequest} from "../utils/handleErrors";
import { updateShop } from "utils/update";
import { getShopJson } from "utils/makeJson";
import { getObjectById } from "utils/getObjectById";
import { deleteObject } from "utils/delete";
import { getAll } from "utils/getBatch";
import { parseIntOrThrow } from "utils/throwers";

const router = express.Router();

// get Shop by ID
router.get("/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await getObjectById(Shop, getShopJson, parseIntOrThrow(req.params["id"]), res)
	}, res, "shopRoutes -> get Shop by ID");
});

// GET all Shops
router.get("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		getAll(Shop, getShopJson, res);
	}, res, "shopRoutes -> get all Shops");
});

// POST create a new Shop
/*required fields in request (ignores others):
name: string
logoImageUrl: string*/
router.post("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		const {name, logoImageUrl} = req.body;
		const shop = await Shop.create({name, logoImageUrl});
		res.status(201).json(await getShopJson(shop));
	}, res, "shopRoutes -> create a new Shop");
});

//PUT update an existing Shop
/*required fields in request (ignores others):
id: number
name: string
logoImageUrl: string*/
router.put("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await updateShop(req, res);
	}, res, "shopRoutes -> update an existing Shop");
});

// DELETE shop by ID
router.delete("/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await deleteObject(Shop, getShopJson, req, res);
	}, res, "shopRoutes -> delete shop by id")
});

export default router;
