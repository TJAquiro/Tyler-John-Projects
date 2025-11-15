import express, { Request, Response } from "express";
import Tag from "../models/Tag";
import {handleRequest} from "../utils/handleErrors";
import { getObjectById } from "utils/getObjectById";
import { getTagJson } from "utils/makeJson";
import ProductHasTags from "models/ProductHasTags";
import { getAll, getBatchByShopId, getManyToManyBatch } from "utils/getBatch";
import { updateManyToMany, updateTag } from "utils/update";
import { deleteObject } from "utils/delete";
import { parseIntOrThrow } from "utils/throwers";

const router = express.Router();

// GET tag by ID
router.get("/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await getObjectById(Tag, getTagJson, parseIntOrThrow(req.params["id"]), res);
	}, res, "tagRoutes -> get tag by ID");
});

// GET all Tags
router.get("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		getAll(Tag, getTagJson, res);
	}, res, "tagRoutes -> get all Tags");
});

// POST create a new Tag
/*required fields in request (ignores others):
name: string
imageUrl: string
shopId: number*/
router.post("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		const { name, imageUrl, shopId } = req.body;
		const tag = await Tag.create({ name, imageUrl, shopId });
		res.status(201).json(getTagJson(tag));
	}, res, "tagRoutes -> create a new Tag");
});

// GET tags by productId
router.get("/productId/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await getManyToManyBatch(Tag, "tagId", ProductHasTags, "productId", parseIntOrThrow(req.params["id"]), getTagJson, res);
	}, res, "tagRoutes -> get Tags by Product ID");
});

// GET Tags by shopID
router.get("/shopId/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await getBatchByShopId(Tag, getTagJson, parseIntOrThrow(req.params["id"]), res);
	}, res, "tagRoutes -> get Tags by shopID");
});

//PUT update an existing Tag
/*required fields in request (ignores others):
name: string
imageUrl: string
shopId: number*/
router.put("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await updateTag(req, res);
	}, res, "tagRoutes -> update an existing Tag");
});

// PUT update tag products
/*required fields in request (ignores others):
productIds: number[]*/
router.put("/:id/productIds", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await updateManyToMany(ProductHasTags, "tagId", "productId", req, res);
	}, res, "tagRoutes -> update tag products");
});

// DELETE tag by ID
router.delete("/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await deleteObject(Tag, getTagJson, req, res);
	}, res, "tagRoutes -> delete tag by id")
});

export default router;
