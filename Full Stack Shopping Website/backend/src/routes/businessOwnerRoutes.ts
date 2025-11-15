import express, { Request, Response } from "express";
import BusinessOwner from "../models/BusinessOwner";
import {handleRequest} from "../utils/handleErrors";
import {getPasswordHash} from "../utils/auth";
import {getBusinessOwnerJson} from "../utils/makeJson";
import {updateBusinessOwner} from "../utils/update";
import {findUsername, getUserByUsernameHandler} from "../utils/findUsername";
import { getObjectById } from "utils/getObjectById";
import { deleteObject } from "utils/delete";
import { getAll } from "utils/getBatch";
import { parseIntOrThrow } from "utils/throwers";

const router = express.Router();

// GET BusinessOwner by ID
router.get("/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await getObjectById(BusinessOwner, getBusinessOwnerJson, parseIntOrThrow(req.params["id"]), res);
	}, res, "businessOwnerRoutes -> get BusinessOwner by ID");
});

// GET BusinessOwner by username
router.get("/getByUsername/:username", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await getUserByUsernameHandler(BusinessOwner, req, res, getBusinessOwnerJson);
	}, res, "businessOwnerRoutes -> get BusinessOwner by username");
});

// POST create a new BusinessOwner
/*required fields in request (ignores others):
firstName: string
lastName: string
username: string
password: string
shopId: number*/
router.post("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		const { firstName, lastName, username, password, shopId } = req.body;

		if ((await findUsername(username)) == -1)
		{
			const hashedPassword = getPasswordHash(password);
			const businessOwner = await BusinessOwner.create({ firstName, lastName, username, password: hashedPassword, shopId });
			res.status(201).json(getBusinessOwnerJson(businessOwner));
		}
		else
		{
			throw new Error("Username '" + username + "' already exists");
		}
	}, res, "businessOwnerRoutes -> create a new BusinessOwner");
});

//PUT update an existing BusinessOwner
/*required fields in request (ignores others):
firstName: string
lastName: string
username: string
shopId: number*/
router.put("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await updateBusinessOwner(req, res);
	}, res, "businessOwnerRoutes -> update an existing BusinessOwner");
});

// DELETE businessOwner by ID
router.delete("/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await deleteObject(BusinessOwner, getBusinessOwnerJson, req, res);
	}, res, "businessOwnerRoutes -> delete businessOwner by id")
});

// get all businessOwners
router.get("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		getAll(BusinessOwner, getBusinessOwnerJson, res);
	}, res, "businessOwnerRoutes -> get all businessOwners");
});

export default router;
