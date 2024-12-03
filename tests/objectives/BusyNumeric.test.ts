import { expect, test } from "vitest";
import { BusyNumeric } from "../../src/objectives/BusyNumeric";

const default_fabric = () => {
  const hotel = new BusyNumeric(12);
  hotel.bifurcate(7);
  hotel.bifurcate(0);
  hotel.bifurcate(1);
  hotel.bifurcate(2);
  hotel.bifurcate(3);
  return hotel;
};

test("Welcome to hotel", () => {
  const hotel = default_fabric();
  expect(hotel).exist;
});

test("Assertions", () => {
  const hotel = default_fabric();

  expect(hotel.range).toBe(12);
  expect(hotel.peak_start_busy).toBe(true);
  expect(hotel.peak_end_busy).toBe(false);
  expect(hotel.segments_count()).toBe(2);
  expect(hotel.segment(0)).toStrictEqual({
    size: 3,
    left: [0, 3],
    right: [7, 7],
  });
  expect(hotel.segment(1)).toStrictEqual({
    size: 5,
    left: [7, 7],
    right: undefined,
  });
  expect(hotel.segment(3)).toBe(undefined);
  expect(hotel.busy_areas).toStrictEqual([
    [0, 3],
    [7, 7],
  ]);
});

test("Create array of segment", () => {
  const hotel = default_fabric();
  const { size, left } = hotel.segment(1)!;

  const start = left?.[1] || 0;
  const array = [...new Array(size)].map((_, i) => start + i + 1);

  expect(array).toStrictEqual([8, 9, 10, 11, 12]);
});

test("Last point busy", () => {
  const hotel = default_fabric();
  hotel.bifurcate(hotel.range);

  expect(hotel.peak_end_busy).toBe(true);
  expect(hotel.segment(1)).toStrictEqual({
    size: 4,
    left: [7, 7],
    right: [12, 12],
  });
});

test("insert_area vs bifurcate. And orderic", () => {
  const _default = default_fabric();
  const hotel = new BusyNumeric(_default.range);
  hotel.insert_area(0, 3);
  hotel.bifurcate(7);

  expect(String(hotel.busy_areas) === String(_default.busy_areas)).toBe(true);
});

test("Overlapping segments handling", () => {
  const hotel = default_fabric();

  expect(() => hotel.bifurcate(0)).toThrow();
  expect(() => hotel.bifurcate(1)).toThrow();
  expect(() => hotel.bifurcate(2)).toThrow();
  expect(() => hotel.bifurcate(3)).toThrow();
  hotel.bifurcate(8);
  hotel.bifurcate(9);
  expect(() => hotel.bifurcate(8)).toThrow();

  expect(hotel.segments_count()).toBe(2);
  expect(hotel.segment(0)).toStrictEqual({
    size: 3,
    left: [0, 3],
    right: [7, 9],
  });
  expect(hotel.segment(1)).toStrictEqual({
    size: 3,
    left: [7, 9],
    right: undefined,
  });
});

test("Empty", () => {
  const hotel = new BusyNumeric(10);
  expect(hotel.segments_count()).toBe(1);
  expect(hotel.busy_areas).toStrictEqual([]);
  expect(hotel.segment(0)).toStrictEqual({
    size: 11,
    left: undefined,
    right: undefined,
  });
});

test("Full merge", () => {
  const hotel = default_fabric();
  hotel.bifurcate(12);
  hotel.bifurcate(8);
  hotel.bifurcate(5);
  hotel.bifurcate(4);
  hotel.bifurcate(6);
  hotel.bifurcate(9);
  hotel.bifurcate(11);
  hotel.bifurcate(10);
  // All segments are filled. Remained only bussy areas
  expect(hotel.segments_count()).toBe(0);
  expect(hotel.busy_areas).toStrictEqual([[0, 12]]);
});

test("Merge strategy 1", () => {
  const hotel = default_fabric();
  hotel.bifurcate(9);
  expect(hotel.busy_areas).toStrictEqual([
    [0, 3],
    [7, 7],
    [9, 9],
  ]);
});

test("Merge strategy 2", () => {
  const hotel = default_fabric();
  hotel.bifurcate(8);
  expect(hotel.busy_areas).toStrictEqual([
    [0, 3],
    [7, 8],
  ]);
});

test("Merge strategy 3", () => {
  const hotel = default_fabric();
  hotel.bifurcate(9);
  expect(hotel.busy_areas).toStrictEqual([
    [0, 3],
    [7, 7],
    [9, 9],
  ]);
  hotel.bifurcate(8);
  expect(hotel.busy_areas).toStrictEqual([
    [0, 3],
    [7, 9],
  ]);
});

test("Dangerous 1: with negative index", () => {
  const hotel = default_fabric();
  expect(hotel.segment(-1)).toStrictEqual({
    size: 5,
    left: [7, 7],
    right: undefined,
  });
});

test("Dangerous 2: strange merge", () => {
  const hotel = default_fabric();
  hotel.bifurcate(8);
  hotel.bifurcate(9);
  hotel.insert_area(2, 8);
  expect(hotel.busy_areas).toStrictEqual([[0, 9]]);
});

test("Dangerous 3: out of range", () => {
  const hotel = default_fabric();

  expect(() => hotel.bifurcate(-1)).toThrow();
  expect(() => hotel.bifurcate(13)).toThrow();
});

test("Dangerous 3: float values", () => {
  const hotel = default_fabric();

  expect(() => hotel.bifurcate(0.5)).toThrow();
});

test.skip("Compare perfomance vs .filter", () => {
  // O(2n) or O(2n * n)?
  // Худший случай состоит в том, что
  // мы не найдем нужного нам элемента и пройдемся по всем элементам.
  // Также проверим тоже самое с использованием классического варианта той же задачи через.filter
  // Этот пример близок к реальному примеру для которого создавался

  // Set to false to check and remove test.skip
  const DISABLED = true;
  const LIST_SIZE = 10_000;
  const HARD_OPERATION_MULTIPLIER = 1_000;
  if (DISABLED) {
    return;
  }

  function random(max: number) {
    if (max === 0) {
      return 0;
    }
    return Math.floor(Math.random() * (max + 1));
  }
  const hard_operation = (satisfies: boolean) => (item, index) => {
    const my_symbol = Symbol(`${item}_${index}`);
    globalThis[my_symbol] = [...new Array(HARD_OPERATION_MULTIPLIER)];
    return satisfies; /* Math.random() >= 0.5 */
  };
  const average: { array_filter: number[]; busy_numeric: number[] } = {
    array_filter: [],
    busy_numeric: [],
  };

  // Result: O(n) — tested under the best conditions
  (() => {
    const starts = Date.now();
    const items = [...new Array(LIST_SIZE)].filter(hard_operation(false));
    const item = items[random(items.length - 1)];
    globalThis[Symbol("item")] = item;
    const ends = Date.now();
    average.array_filter.push(ends - starts);
  })();

  // Result: O(n) — tested under the best conditions
  (() => {
    const starts = Date.now();
    const items = [...new Array(LIST_SIZE)].filter(hard_operation(true));
    const item = items[random(items.length - 1)];
    globalThis[Symbol("item")] = item;
    const ends = Date.now();
    average.array_filter.push(ends - starts);
  })();

  // Result: O(1.15n) — tested under the best conditions
  (() => {
    const starts = Date.now();
    const hotel = new BusyNumeric(LIST_SIZE);
    while (true) {
      const segments_count = hotel.segments_count();
      if (!segments_count) {
        globalThis[Symbol("item")] = 1;

        break;
      }

      const { left, size } = hotel.segment(random(segments_count - 1))!;
      const i = (left?.[1] ?? -1) + random(size - 1) + 1;

      if (hard_operation(false)(undefined, i)) {
        break;
      }
      hotel.bifurcate(i);
    }
    const ends = Date.now();
    average.busy_numeric.push(ends - starts);
  })();

  // Result: O(1)
  (() => {
    const starts = Date.now();
    const hotel = new BusyNumeric(LIST_SIZE);
    while (true) {
      const segments_count = hotel.segments_count();
      if (!segments_count) {
        globalThis[Symbol("item")] = 1;

        break;
      }

      const { left, size } = hotel.segment(random(segments_count - 1))!;
      const i = (left?.[1] ?? -1) + random(size - 1) + 1;

      if (hard_operation(true)(undefined, i)) {
        break;
      }
      hotel.bifurcate(i);
    }
    const ends = Date.now();
    average.busy_numeric.push(ends - starts);
  })();

  // uncomment if you like
  console.info(average);

  // ~ Result { array_filter: [ 169ms, 263ms ], busy_numeric: [ 228ms, 0ms ] } for 1_000 items with work: create array with 100 items
  /*
  Interesting: it loses superiority also from complicating the work done into hard_operation function. Although presumably it should be the other way around. Also, as expected, when the hard_operation function is empty, the result is worse on average twenty-five times worse on average for both scenarios: the worst and the best.
  The advantage of this algorithm is that the worst-case scenario does not occur. For example, for a problem with a hotel where ninety-nine rooms are free and one is occupied - and we need to choose a random one, the algorithm will cope instantly. The same result can be achieved by selecting a random room, but if the scenario is reversed, where ninety-nine rooms are occupied and one is free, then by random poking the number of checks for each room will be close to the number of rooms (n²). To avoid this, we filter the numbers first and then select a random one afterwards. But then in the best scenario the execution time will be the same as for the worst one. In summary, segmenting numbers, although expensive, solves both problems described above.
  */
  expect(
    average.array_filter.reduce((acc, value) => acc + value) >=
      average.busy_numeric.reduce((acc, value) => acc + value),
  ).toBe(true);
});


test("Calculate free area", () => {
  const hotel = default_fabric();
  expect(hotel.free).toBe(7);
  hotel.bifurcate(9);
  hotel.bifurcate(8);
  expect(hotel.free).toBe(5);
})