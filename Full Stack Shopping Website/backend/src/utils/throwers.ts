/**
 * Attempts to parse a given string to an integer.
 * @param toParse string to be converted to an integer
 * @returns the integer value represented by the given string
 * @throws error if the given string doesn't represent an integer
 */
export function parseIntOrThrow(toParse: string): number
{
	const value = parseInt(toParse);

	if (!Number.isInteger(value))
	{
		throw new Error("Given value '" + toParse + "' must be an integer.");
	}

	return value;
}

/**
 * Throw an error with a given error message if a given value is undefined.
 * 
 * @param value value to check for undefined-ness
 * @param errMsg error message to throw
 * @throws error if value is undefined
 */
export function throwIfUndefined(value: any, errMsg: string) : void
{
	if (typeof value == 'undefined')
	{
		throw new Error(errMsg);
	}
}

/**
 * Checks that given list is an array with all elements matching the given type.
 * 
 * If given list is undefined, or not an array, or not all elements match the given type,
 * throws a customized error based on fieldName and type.
 * 
 * @param list value to typecheck
 * @param fieldName name of field to warn the caller about in case of error
 * @param type type all elements of list must match
 * @throws error if list isn't an array with all elements matching type
 */
export function throwIfWrongListType(list: any, fieldName: string, type: string) : void
{
	const baseErrMsg = `Request must contain field '${fieldName}' which is a list of ${type}s.`;

	throwIfUndefined(list, `No ${fieldName} field found. ` + baseErrMsg);

	if (!Array.isArray(list))
	{
		throw new Error(`${fieldName} field is not a list. ` + baseErrMsg);
	}

	for (let i = 0; i < list.length; i++)
	{
		if (typeof list[i] != type)
		{
			throw new Error(`Non-${type} element of ${fieldName} list detected. In list [` +
							list + `], '` + list[i] + `' at index ` + i + ` is not a ${type}. ` + baseErrMsg);
		}
	}
}