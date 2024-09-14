// Если большее, то идёт к меньшим
export function binary_search(max: number, compare: (index: number) => number) {
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
