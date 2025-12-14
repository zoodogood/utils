export const existsSymbol = Symbol('isExist')
export function deepEqual(target: unknown, compare: unknown): boolean {
	if (target === compare) {
		return true
	}

	if (typeof target !== typeof compare) {
		return false
	}

	if (
		Object.keys(target as object).length !==
		Object.keys(compare as object).length
	) {
		return false
	}

	return Object.entries(target as object).every(([key, value]) =>
		deepEqual(value, (compare as { [key: string]: unknown })[key]),
	)
}

export function checkProperiesExistsOrEqual(
	match: object,
	target: { [key: string]: unknown },
): boolean {
	return Object.entries(match).every(([key, value]: [string, unknown]) => {
		if (value === existsSymbol) {
			return key in target
		}

		if (typeof target[key] !== 'object') {
			return deepEqual(value, target[key])
		}

		return checkProperiesExistsOrEqual(
			value as object,
			target[key] as { [key: string]: unknown },
		)
	})
}
