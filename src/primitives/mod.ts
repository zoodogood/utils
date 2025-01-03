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
function ending(
  quantity = 0,
  base: string,
  multiple: string,
  alone: string,
  double: string,
  options: IEndingOptions = {},
) {
  if (isNaN(quantity)) return NaN;

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
