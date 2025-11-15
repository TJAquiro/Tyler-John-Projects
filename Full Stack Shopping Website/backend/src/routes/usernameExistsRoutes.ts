import express, { Request, Response } from "express";
import {handleRequest} from "../utils/handleErrors";
import {findUsername} from "../utils/findUsername";

const router = express.Router();

// check if any BusinessOwner or Customer has a given username 
router.get("/:username", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		const username = req.params["username"];
		if ((await findUsername(username)) == -1)
		{
			res.json({exists: false});
		}
		else
		{
			res.json({exists: true});
		}
	}, res, "usernameExistsRoutes");
});

export default router;
