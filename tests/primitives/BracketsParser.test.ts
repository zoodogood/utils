import { BracketsParser } from "../../src/primitives/BracketsParser.js";
import { expect, test } from "vitest";
test("Nested groups", () => {
  const text = '({}[{"nested"}])';
  const parser = new BracketsParser();
  const result = parser
    .addBracketVariant(...BracketsParser.defaultBracketVariants)
    .parse(text);

  expect(result.groups).toHaveLength(5);
});
