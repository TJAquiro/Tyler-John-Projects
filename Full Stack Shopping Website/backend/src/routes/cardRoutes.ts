import express, { Request, Response } from "express";
import Card from "../models/Card";
import {handleRequest} from "../utils/handleErrors";
import {getCardJson} from "utils/makeJson";
import { updateCard } from "utils/update";
import { getObjectById } from "utils/getObjectById";
import { deleteObject } from "utils/delete";
import { getAll } from "utils/getBatch";
import { parseIntOrThrow } from "utils/throwers";

const router = express.Router();

// get Card by ID
router.get("/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await getObjectById(Card, getCardJson, parseIntOrThrow(req.params["id"]), res)
	}, res, "cardRoutes -> get Card by ID");
});

// POST create a new Card
/*required fields in request (ignores others):
cardNumber: string
securityCode: string
pin: string
type: string
billingAddress: string
cardHolder: string
expirationDate: Date*/
router.post("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		const { cardNumber, securityCode, pin, type, billingAddress, cardHolder, expirationDate } = req.body;
		const card = await Card.create({ cardNumber, securityCode, pin, type, billingAddress, cardHolder, expirationDate });
		res.status(201).json(getCardJson(card));
	}, res, "cardRoutes -> create a new Card");
});

//PUT update an existing Card
/*required fields in request (ignores others):
cardNumber: string
securityCode: string
pin: string
type: string
billingAddress: string
cardHolder: string
expirationDate: Date*/
router.put("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await updateCard(req, res);
	}, res, "cardRoutes -> update an existing Card");
});

// DELETE card by ID
router.delete("/:id", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await deleteObject(Card, getCardJson, req, res);
	}, res, "cardRoutes -> delete card by id")
});

// get all Cards
router.get("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		getAll(Card, getCardJson, res);
	}, res, "cardRoutes -> get all Cards");
});

export default router;
