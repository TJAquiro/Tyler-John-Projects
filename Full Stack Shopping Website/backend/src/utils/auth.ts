import * as crypto from 'crypto';
import {Request, Response} from 'express';
import {Model, ModelStatic, WhereOptions} from 'sequelize';
import { throwIfUndefined } from './throwers';

/**
 * Takes a password as an argument, returns a hash value.
 * Throws an error if the given string is empty, but otherwise doesn't check password for validity
 * @param passwordText A password as passed to the server by the client
 * @returns The SHA256 hash of the given password, as a string of hex digits
 * @throws Error if passwordText is an empty string
 */
export function getPasswordHash(passwordText: string): string
{
	if (passwordText === "")
	{
		throw new Error("Invalid argument: Empty string given to getPasswordHash")
	}
	const hash = crypto.createHash('sha256');
	hash.update(passwordText, 'utf8');
	return hash.digest('hex');
}

/**
 * 
 * @param userType the type of user to check; either Customer or BusinessOwner
 * @param req request containing a username field in req.params and a password field in req.body
 * @param res response object to write output to
 * @throws error if no username and/or password field is provided
 */
export async function authenticatePassword<T extends Model>(userType: ModelStatic<T>, req: Request, res: Response): Promise<void>
{
	const username = req.params["username"];
	throwIfUndefined(username, "Must provide username in req.params");

	const user = await userType.findOne({
		where: {
			username: username
		} as WhereOptions});
	
	if (user == null)
	{
		res.json({valid: false,
					id: -1});
	}
	else
	{
		const givenPassword = req.body["password"];
		throwIfUndefined(givenPassword, "Must provide user password in field named 'password'");
		
		const hashedPassword = getPasswordHash(givenPassword);
		const realPassword = user.getDataValue('password');
		const isValid = (hashedPassword == realPassword);
		res.json({valid: isValid,
					id: user.getDataValue('id')});
	}
}