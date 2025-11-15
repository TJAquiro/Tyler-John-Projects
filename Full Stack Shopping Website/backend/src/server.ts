import express from "express";
import dotenv from "dotenv";
import customerRoutes from "./routes/customerRoutes";
import productRoutes from "./routes/productRoutes";
import cardRoutes from "./routes/cardRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import tagRoutes from "./routes/tagRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import businessOwnerRoutes from "./routes/businessOwnerRoutes";
import discountRoutes from "./routes/discountRoutes";
import shopRoutes from "./routes/shopRoutes";
import usernameExistsRoutes from "./routes/usernameExistsRoutes";
import authenticatePasswordRoutes from "./routes/authenticatePasswordRoutes";
import imageRoutes from "routes/imageRoutes";
import {createRelations} from "./models/create_relations";
import sequelize from "./db/db";
import cors from "cors";
import { initializeIfEmpty } from "db/initialize";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors());
// allow frontend to access this server
const corsOptions = {
	origin: process.env.FRONTEND_DOMAIN,
}

app.use(cors(corsOptions));
/*app.use(function allowAccess(req, res, next) {
	//adds frontend domain to the list of domains responses can be sent to
	res.set('Access-Control-Allow-Origin', process.env.FRONTEND_DOMAIN);
	//add 'content-type' header to the list of headers allowed to be responded to
	res.set('Access-Control-Allow-Headers', 'content-type');
	//add post, put, get, and delete to allowed methods
	res.set('Access-Control-Allow-Methods', ['POST', 'PUT', 'GET', 'DELETE']);
	next();
});*/
// Use api routes
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/businessOwners", businessOwnerRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/usernameExists", usernameExistsRoutes);
app.use("/api/authenticate", authenticatePasswordRoutes);
app.use("/api/images", imageRoutes);


// Define object relationships
createRelations();

// Start the server and connect to DB
sequelize.sync({
	force: false,
	alter: true
}).then(async () => {
	await initializeIfEmpty();
	const port = process.env.PORT;
	app.listen(port, () => {
    	console.log(`Server running on port ${port}`);
	});
});
