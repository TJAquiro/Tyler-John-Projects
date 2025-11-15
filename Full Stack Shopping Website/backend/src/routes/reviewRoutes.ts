import express, { Request, Response } from "express";
import Review from "../models/Review";
import {handleRequest} from "../utils/handleErrors";

const router = express.Router();

// GET all Reviews
router.get("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		const reviews = await Review.findAll();
		res.json(reviews);
	}, res, "reviewRoutes -> get all Reviews");
});

// POST create a new Review
router.post("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		const { reviewText } = req.body;
		const review = await Review.create({ reviewText });
		res.status(201).json(review);
	}, res, "reviewRoutes -> create a new Review");
});

export default router;
