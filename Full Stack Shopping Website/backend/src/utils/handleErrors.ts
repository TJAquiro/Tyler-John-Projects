 import {Response} from "express";

 /**
  * Creates an error message given an error and a location 
  * @param error The error caught by a try-catch
  * @param location A description of the error's location, i.e. filename and function
  * @returns Either error.message if error is an Error, or the string "Unknown error in [location]"
  */
export function errorMessage(error: any, location: string) : string
{
	if (error instanceof Error)
	{
		return error.name + ": " + error.message + " -- triggered in " + location;
	}
	else
	{
		return ("Unknown error in " + location);
	}
}

/**
 * Attempts to run the given request handler function. If an error occurs, puts an error message in the provided response.
 * @param handler the code this function will attempt to run
 * @param res the Response object error messages will be written to
 * @param location a description of the location of the caller i.e. filename and function; potentially used in producing the error message
 */
export async function handleRequest(handler: () => Promise<void>, res: Response, location: string): Promise<void> {
	try
	{
		await handler();
	}
	catch (error)
	{
		res.status(500).json({ message: errorMessage(error, location) });
	}
}