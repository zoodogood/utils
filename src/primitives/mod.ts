export * from "./TextTableBuilder.js";
export * from "./BracketsParser.js";

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

export { ending };
