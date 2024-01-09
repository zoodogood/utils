export function* rangeToArray([min, max]: [number, number]) {
  if (isNaN(min) || isNaN(max)) {
    yield NaN;
    return;
  }
  const count = max - min + 1;
  for (let index = 0; index < count; index++) {
    yield index + min;
  }
  return;
}
