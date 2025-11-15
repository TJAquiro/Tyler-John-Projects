import {Response} from "express";
import { Model, ModelStatic } from "sequelize";
import { JsonFunc } from "./makeJson";

/**
 * Gets an object with ID matching objectId and writes it to res
 * @param objectClass the table the object is stored in
 * @param getJsonFunc the function to be used to convert the object into a JSON
 * @param objectId the ID of the object in its table
 * @param res the response to be sent to the frontend
 * @throws error if given object ID is NaN
 * @throws error if no object matching the given ID is found
 */
export async function getObjectById<T extends Model>(objectClass: ModelStatic<T>,
												getJsonFunc: JsonFunc<T>,
												objectId: number,
												res: Response): Promise<void>
{
	if (isNaN(objectId))
	{
		throw new Error("Given ID is not a number");
	}

	const objectInTable = await objectClass.findByPk(objectId);
	if (objectInTable == null) {
		throw new Error("ID #" + objectId + " not found in " + objectClass.tableName + " table");
	}
	res.json(await getJsonFunc(objectInTable));
}