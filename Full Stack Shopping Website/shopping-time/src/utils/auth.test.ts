import * as crypto from 'crypto';
import { getPasswordHash } from './auth';
import { describe, it, expect } from 'vitest';

describe("Password hash generator", () => {
	it("outputs matches crypto.hash.digest() test 1", () => {
		const testPassword = "test password";
		const hash = crypto.createHash('sha256');
		hash.update(testPassword, 'utf8');
		expect(getPasswordHash(testPassword)).toBe(hash.digest('hex'));
	});

	it("outputs matches crypto.hash.digest() test 2", () => {
		const testPassword = "another";
		const hash = crypto.createHash('sha256');
		hash.update(testPassword, 'utf8');
		expect(getPasswordHash(testPassword)).toBe(hash.digest('hex'));
	});

	it("outputs matches crypto.hash.digest() test 3", () => {
		const testPassword = "12345";
		const hash = crypto.createHash('sha256');
		hash.update(testPassword, 'utf8');
		expect(getPasswordHash(testPassword)).toBe(hash.digest('hex'));
	});

	it("throws a custom error if given an empty string", () => {
		expect(() => getPasswordHash("")).toThrowError(/Empty string/);
	});
})