import { expect, test } from "vitest";
import { binary_search } from "../../src/primitives/binary_search";

test("binary_search", () => {
  const target = 3;
  const index = binary_search(20, (index) => index - target);

  expect(index).toBe(target);
});

test("Compare two items", () => {
  const array = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26,
  ];
  const big_than = 9;

  const index =
    binary_search(array.length - 1, (index) => {
      const value = array[index];
      const biggest = big_than < value;
      if (biggest) {
        return 1;
      }
      return +(array[index + 1] > big_than) - 1;
    }) + 1;
  const expected = 10;
  expect(array[index]).toBe(expected);
});
