import {Model, ModelStatic} from "sequelize";
import {Request, Response} from "express";
import { JsonFunc } from "./makeJson";
import { parseIntOrThrow } from "./throwers";

/**
 * Deletes the entry with ID matching req.params["id"] from the table referred to by ObjectClass.
 * 
 * Writes the deleted object to res as a Record using the provided getJsonFunc.
 * 
 * If no object was found to delete, writes an empty object to res.
 * 
 * @param objectClass table to delete from
 * @param getJsonFunc function to convert object to Record
 * @param req request from frontend, must contain "id" field in req.params
 * @param res response to be sent to frontend
 */
export async function deleteObject<T extends Model>(objectClass: ModelStatic<T>, getJsonFunc: JsonFunc<T>, req: Request, res: Response): Promise<void>
{
	const toDelete = await objectClass.findByPk(parseIntOrThrow(req.params["id"]));
	let response: Record<string, any> = {};

	if (!(toDelete == null))
	{
		response = await getJsonFunc(toDelete);
		await toDelete.destroy();
	}
	
	res.json(response);
}