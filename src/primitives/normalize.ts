export function normalize_to_integer(list: number[]) {
  // (1 / 3) * 1e15 === 333 333 333 333 333.3
  const MIN_OPTIMAL_VALUE = 1e16;
  return list.map((x) => Math.floor(x * MIN_OPTIMAL_VALUE));
}
