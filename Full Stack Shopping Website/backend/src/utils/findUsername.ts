import { Model, ModelStatic, WhereOptions } from "sequelize";
import BusinessOwner from "../models/BusinessOwner";
import Customer from "../models/Customer";
import {Request, Response} from "express";
import { JsonFunc } from "./makeJson";

/**
 * Checks whether a given username is already being used by any BusinessOwner or Customer.
 * @param username the username to be checked
 * @returns the id of a match, or -1 if no matches exist
 */
export async function findUsername(username: string): Promise<number>
{
	const matchInBusinessOwners = await getUserByUsername(BusinessOwner, username);
	if (matchInBusinessOwners != null)
	{
		return matchInBusinessOwners.getDataValue('id');
	}

	const matchInCustomers = await getUserByUsername(Customer, username);
	if (matchInCustomers != null)
	{
		return matchInCustomers.getDataValue('id');
	}
	
	return -1;
}

/**
 * Searches the userClass table for a user with a given username.
 * @param userClass table to query
 * @param username username to search for
 * @returns a user object if one was found, or null
 */
export async function getUserByUsername<T extends Model>(userClass: ModelStatic<T>, username: string): Promise<T | null>
{
	const match = await userClass.findOne({
		where: {
			username: username
		} as WhereOptions
	});

	return match;
}

/**
 * Extracts username from a given request.params and tries to find a user matching that username.
 * Writes user to res if a matching user was found, otherwise throws an error.
 * @param userClass the type of user to find
 * @param req the request received from the frontend
 * @param res the response to be sent to the frontend
 * @param getJsonFunc the function used to convert the located user into a Record
 * @throws error if no user with the desired username is found
 */
export async function getUserByUsernameHandler<T extends Model>(userClass: ModelStatic<T>, req: Request, res: Response, getJsonFunc: JsonFunc<T>): Promise<void>
{
	const username = req.params["username"];

	const getUser = await getUserByUsername(userClass, username);

	if (getUser == null)
	{
		throw new Error ("Username '" + username + "' not found in " + userClass.tableName)
	}

	res.json(await getJsonFunc(getUser));
}