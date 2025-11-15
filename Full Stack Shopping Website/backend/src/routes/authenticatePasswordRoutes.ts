import express, { Request, Response } from "express";
import Customer from "../models/Customer";
import BusinessOwner from "../models/BusinessOwner";
import {handleRequest} from "../utils/handleErrors";
import {authenticatePassword} from "../utils/auth";

const router = express.Router();

// authenticate Customer password given username
/*required fields in request (ignores others):
password: string*/
router.post("/customer/:username", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await authenticatePassword(Customer, req, res);
	}, res, "authenticatePasswordRoutes -> authenticate Customer password");
});

// authenticate BusinessOwner password given username
/*required fields in request (ignores others):
password: string*/
router.post("/businessOwner/:username", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		await authenticatePassword(BusinessOwner, req, res);
	}, res, "authenticatePasswordRoutes -> authenticate BusinessOwner password");
});

export default router;
