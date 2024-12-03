import assert from "node:assert";
// Если большее, то идёт к меньшим
export function binary_search(max: number, compare: (index: number) => number) {
  assert(max >= 0);
  assert(Number.isInteger(max));
  let min = 0;
  while (true) {
    const index = Math.floor((min + max) / 2);
    const compared = compare(index);
    if (compared === 0) {
      return index;
    }
    if (min === max) {
      return -1;
    }
    if (compared > 0) {
      max = index - 1;
      continue;
    }
    min = index + 1;
  }
}

export const enum BinarySearchResultEnum {
  NotFound = -1,
}

export const enum BinarySearchCompareSpec {
  Biggest = 1,
  Equal = 0,
  Smallest = -1
}