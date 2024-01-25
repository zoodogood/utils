import { BracketsParser } from "../../src/primitives/BracketsParser.js";
import { expect, test } from "vitest";
test(() => {
  const text = '({}[{"nested"}])';
  const parser = new BracketsParser();
  const result = parser
    .addBracketVariant(...BracketsParser.defaultBracketVariants)
    .parse(text);

  expect(result.groups).toHaveLength(4);
});
