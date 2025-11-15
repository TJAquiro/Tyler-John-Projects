import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { handleRequest } from "utils/handleErrors";

const router = express.Router();

/*ChatGPT usage: all file storage related code in this file was written by ChatGPT
Prompt:
"
I'm using the express library in typescript to do 2 things: (1), receive an image from an HTTP PUT request and save it in a folder called "images"; (2), respond to HTTP GET requests by sending the image at the requested path. Finish my code by writing code inside the callback function parameter of handleRequest:

import express, { Request, Response } from "express";
import { handleRequest } from "utils/handleErrors";

const router = express.Router();

// get the image at a specified path (relative to "..\..\images\") 
router.get("/:imageUrl", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		
	}, res, "imageRoutes -> get the image at a specified path");
});

// PUT upload a new image at a specified path (relative to "..\..\images\")
router.put("/:imageUrl", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		
	}, res, "imageRoutes -> upload a new image");
});

export default router;
"
 - Hugh
*/

/*
I added this const since ChatGPT originally just reused the same path.join call multiple times
- Hugh
*/
const imagesDirPath = path.join(__dirname, "..", "..", "images");

// Set up multer storage for uploading images
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, imagesDirPath); // specify the images folder
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname); // preserve original file extension
		const filename = Date.now() + ext; // name file by timestamp to avoid conflicts
		cb(null, filename);
	}
});

const upload = multer({ storage });

// get all existing filenames
/*
I wrote the code for this route myself
- Hugh
*/
router.get("/", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		const filenames = fs.readdirSync(imagesDirPath);
		res.json(filenames);
	}, res, "imageRoutes -> get all existing filenames")
});

// get the image at a specified path (relative to "..\..\images\") 
router.get("/:imageUrl", async (req: Request, res: Response) => {
	await handleRequest(async () => {
		const imageUrl = req.params["imageUrl"];
		const imagePath = path.join(imagesDirPath, imageUrl);

		// Check if file exists
		if (!fs.existsSync(imagePath))
		{
			/*
			ChatGPT used a different way of handling if the file didn't exist,
			but I rewrote it to this because throwing an error and letting the handleRequest
			function deal with it is how the other routes work. - Hugh
			*/
			throw new Error("File '" + imageUrl + "' not found.");
		}

		// Send image as a response
		res.sendFile(imagePath);
	}, res, "imageRoutes -> get the image at a specified path");
});

// PUT upload a new image at a specified path (relative to "..\..\images\")
router.put("/:imageUrl", upload.single("image"), async (req: Request, res: Response) => {
	await handleRequest(async () => {
		if (!req.file)
		{
			/*
			I rewrote this error handler too. - Hugh
			*/
			throw new Error ("No file uploaded");
		}

		const imageUrl = req.params["imageUrl"];
		const imagePath = path.join(imagesDirPath, imageUrl);

		// You may rename or save with a new name if needed
		fs.renameSync(req.file.path, imagePath); // rename the uploaded file to the desired path

		res.status(200).json(`Image uploaded successfully: ${imageUrl}`);
	}, res, "imageRoutes -> upload a new image");
});

export default router;
