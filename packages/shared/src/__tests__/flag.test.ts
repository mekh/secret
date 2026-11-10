import { describe, expect, it } from "vitest";
import { parseFlag } from "../flag.js";

class SettingError extends Error {}

describe("parseFlag", () => {
	it.each([
		["1", true],
		["TRUE", true],
		[" 0 ", false],
		["False", false],
	])("reads %j as %s", (value, expected) => {
		expect(parseFlag({ name: "FLAG", value })).toBe(expected);
	});

	it.each([[""], ["  "], [undefined]])("leaves %j to the caller's default", (value) => {
		expect(parseFlag({ name: "FLAG", value })).toBeUndefined();
	});

	it("refuses a value that is neither on nor off, naming the setting", () => {
		expect(() => parseFlag({ name: "FLAG", value: "yes" })).toThrow(
			new RangeError("FLAG must be true or false (or 1 or 0)"),
		);
	});

	it("throws the caller's error class when it gives one", () => {
		expect(() => parseFlag({ name: "FLAG", value: "yes", errorClass: SettingError })).toThrow(
			SettingError,
		);
	});
});
