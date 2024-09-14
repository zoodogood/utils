import { test } from "vitest";
import { normalize_to_integer } from "../../src/primitives/normalize";

test("normalize_to_integer", () => {
  const array = [0.1, 0.2, 0.3];
  normalize_to_integer(array);
});
