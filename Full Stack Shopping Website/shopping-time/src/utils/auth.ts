import * as crypto from 'crypto';

/**
 * Takes a plaintext password as an argument, returns a hash value.
 * Throws an error if the given string is empty, but otherwise doesn't check password for validity
 * @param passwordText A password as entered by a user
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