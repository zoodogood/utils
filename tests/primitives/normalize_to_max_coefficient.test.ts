import { expect, test } from "vitest";
import { normalize_to_max_coefficient } from "../../src/primitives/normalize";

test("normalize_to_max_coefficient", () => {
  const array = [0.1, 0.2, 0.3];
  const normalized = normalize_to_max_coefficient(array);
  expect(normalized).toStrictEqual([
    1501199875790165,
    3002399751580330,
    4503599627370495,
  ]);
});
