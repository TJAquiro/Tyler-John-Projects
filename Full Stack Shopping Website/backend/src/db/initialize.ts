import Shop from "../models/Shop";
import BusinessOwner from "../models/BusinessOwner";
import {getPasswordHash} from "../utils/auth";

/**
 * Creates a Shop and a BusinessOwner if none currently exist in the database.
 */
export async function initializeIfEmpty(): Promise<void>
{
	let someShop = await Shop.findOne();
	const someBusinessOwner = await BusinessOwner.findOne();

	if (someShop == null && !(someBusinessOwner == null))
	{
		/*Shouldn't be reachable since BusinessOwner has shopId as a required foreign key, so no BusinessOwner can exist if no Shop exists*/
		throw new Error ("Invalid state occurred: BusinessOwner exists without corresponding Shop");
	}

	if (someShop == null)
	{
		someShop = await Shop.create({
			name: "Shopping Time",
			logoImageUrl: "default-logo.png"
		});
	}

	if (someBusinessOwner == null)
	{
		await BusinessOwner.create({
			firstName: "Bizz",
			lastName: "Nisona",
			username: "bniso",
			password: getPasswordHash("genericPassword"),
			shopId: someShop.getDataValue('id')
		});
	}
}