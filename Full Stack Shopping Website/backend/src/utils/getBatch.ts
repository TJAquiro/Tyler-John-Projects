import {Response} from "express";
import { Model, ModelStatic, Op, WhereOptions } from "sequelize";
import { getJsonBatch, JsonFunc } from "./makeJson";

/**
 * Gets all entries in a given table, converts them to Records using the given getJsonFunc, and writes the list of Records to res.
 * @param table Table to get entries from.
 * @param getJsonFunc Function to convert table entries into Records
 * @param res Response to write Record list to
 */
export async function getAll<T extends Model>(table: ModelStatic<T>, getJsonFunc: JsonFunc<T>, res: Response): Promise<void>
{
	const objects = await table.findAll();
	const objectJsons = objects.map(object => getJsonFunc(object));
	const objectJsonsResolved = await Promise.all(objectJsons);
	res.json(objectJsonsResolved);
}

/**
 * Converts a list of IDs into a list of Records representing objects in the database
 * @param table the table holding the objects to be retrieved
 * @param objectIds the IDs (primary key values) of the objects to be retrieved
 * @param getJsonFunc the function to be called on object instances to convert them into a Record
 * @returns a list of Records representing objects in the form expected by the frontend
 */
export async function getJsonBatchUsingIds<T extends Model>(table: ModelStatic<T>, objectIds: number[], getJsonFunc: JsonFunc<T>): Promise<Record<string, any>[]>
{
	const getObjects = await table.findAll({
		where: {
			id: {[Op.in]: objectIds}
		} as WhereOptions
	});

	return await getJsonBatch(getObjects, getJsonFunc)
}

/**
 * Gets all objects in originTable which are associated with targetId in joinTable,
 * and writes those objects to res using the provided getJsonFunc
 * 
 * Equivalent to executing the following SQL query on the database:
 * 
 * SELECT * FROM originTable
 * WHERE originTable.id IN (
 * 		SELECT originFKName FROM joinTable
 * 		WHERE joinTable.targetFKName = targetId);
 * 
 * Takes the outputs of the query, packages them using the provided getJsonFunc, and writes to res.
 * @param originTable table containing the type of objects this function will return
 * @param originFKName name of output objects' foreign key in targetTable
 * @param joinTable table containing columns named originIdName and targetIdName
 * @param targetFKName name of query objects' foreign key in targetTable
 * @param targetId ID to match in target table
 * @param getJsonFunc function used to convert origin objects into a json
 * @param res response to be sent to frontend
 */
export async function getManyToManyBatch<O extends Model, J extends Model>(originTable: ModelStatic<O>,
												originFKName: string,
												joinTable: ModelStatic<J>,
												targetFKName: string,
												targetId: number,
												getJsonFunc: (arg0: O) => (Promise<Record<string, any>> | Record<string, any>),
												res: Response): Promise<void>
{
	if (isNaN(targetId))
	{
		throw new Error("Given ID is not a number");
	}

	const getObjectIds = await joinTable.findAll({
		attributes: [originFKName],
		where: {
			[targetFKName]: targetId
		} as WhereOptions
	});

	const objectIdsAsNumbers = getObjectIds.map((object) => object.getDataValue(originFKName));
	
	/*const getObjects = await originTable.findAll({
		where: {
			id: {[Op.in]: objectIdsAsNumbers}
		} as WhereOptions
	});*/
	
	res.json(await getJsonBatchUsingIds(originTable, objectIdsAsNumbers, getJsonFunc));
}

/**
 * Gets all entries in the objectClass table where the shopId field = shopId.
 * Writes result to res using provided getJsonFunc
 * @param objectClass table to query
 * @param getJsonFunc function to turn results into a json
 * @param queryShopId shopId value to search for
 * @param res response to be sent to the frontend
 */
export async function getBatchByShopId<T extends Model>(objectClass: ModelStatic<T>,
														getJsonFunc: JsonFunc<T>,
														queryShopId: number,
														res: Response
): Promise<void>
{
	if (isNaN(queryShopId))
	{
		throw new Error("Given ID is not a number");
	}

	const getObjects = await objectClass.findAll({
		where: {
			shopId: queryShopId
		} as WhereOptions
	});

	res.json(await getJsonBatch(getObjects, getJsonFunc));
}