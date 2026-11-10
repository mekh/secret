const ON = new Set(["1", "true"]);
const OFF = new Set(["0", "false"]);

export interface FlagSetting {
	/** The variable's name, for the error. */
	readonly name: string;
	readonly value: string | undefined;
	/** What a value that is neither on nor off throws; RangeError by default. */
	readonly errorClass?: new (
		message: string,
	) => Error;
}

/**
 * An on/off setting, for the API and the web server alike. Blank is undefined,
 * so the caller's default applies; a typo such as `yes` throws rather than mean off.
 */
export function parseFlag(setting: FlagSetting): boolean | undefined {
	const normalized = (setting.value ?? "").trim().toLowerCase();

	if (normalized === "") {
		return undefined;
	}

	if (ON.has(normalized)) {
		return true;
	}

	if (OFF.has(normalized)) {
		return false;
	}

	const ErrorClass = setting.errorClass ?? RangeError;

	throw new ErrorClass(`${setting.name} must be true or false (or 1 or 0)`);
}
