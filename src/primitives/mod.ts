export * from "./binary_search.js";
export * from "./BracketsParser.js";
export { CliParser } from "./CliParser.js";
export * from "./createDefaultPreventable.js";
export * from "./normalize.js";
export * from "./symbols.js";
export * from "./TextTableBuilder.js";

interface IEndingOptions {
	unite?: (quantity: number, word: string) => string;
}
export function ending(
	quantity: number,
	base: string,
	multiple: string,
	alone: string,
	double: string,
	options: IEndingOptions = {},
) {
	if (Number.isNaN(+quantity)) {
		return Number.NaN;
	}

	const target = quantity % 100 < 20 ? quantity % 20 : quantity % 10;

	const end =
		target >= 5 || target === 0 ? multiple : target > 1 ? double : alone;
	const word = base + end;

	options.unite ||= (quantity, word) => `${quantity} ${word}`;

	const input = options.unite(quantity, word);
	return input;
}

export function sortMutByResolve<T>(
	array: T[],
	resolve: ($: T) => number,
	{ reverse }: { reverse?: boolean } = {},
) {
	return reverse
		? array.sort((a, b) => resolve(a) - resolve(b))
		: array.sort((a, b) => resolve(b) - resolve(a));
}

export function arrayEmpty<T>(array: Array<T>) {
	array.splice(0, array.length);
	return array;
}

export function arraySpliceItem<T>(array: T[], searchElement: T) {
	const index = array.indexOf(searchElement);
	if (index === -1) {
		return false;
	}
	array.splice(index, 1);
	return true;
}
