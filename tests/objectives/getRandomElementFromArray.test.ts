import { expect, test } from "vitest";
import {
  getRandomElementFromArray,
  RandomizerContext,
} from "../../src/objectives/getRandomElementFromArray";
import { normalize_to_max_coefficient } from "../../src/primitives/normalize";
test("getRandomElementFromArray", () => {
  const array = [0, 1];
  const associatedWeights = [1, 1];

  const output = getRandomElementFromArray(array, {
    associatedWeights,
    filter: (item: number) => item === 1,
  });
  expect(output).toBe(1);
});

test("Every element included", () => {
  const array = [0, 1, 2];
  const associatedWeights = [1, 1, 1];
  const pull = [] as number[];
  getRandomElementFromArray(array, {
    associatedWeights,
    filter: (item: number) => {
      pull.push(item);
      return false;
    },
  });

  const every = array.every((item) => pull.includes(item));
  expect(every).toBe(true);
});

test("Without weights", () => {
  const array = [0, 1, 2];
  const pull = [] as number[];
  getRandomElementFromArray(array, {
    filter: (item: number) => {
      pull.push(item);
      return false;
    },
  });

  const every = array.every((item) => pull.includes(item));
  expect(every).toBe(true);
});

test("Use normalize to max coefficient", () => {
  const array = [1, 1, 1, 1];
  const associatedWeights = normalize_to_max_coefficient([1, 25, 30, 1]);
  const result = getRandomElementFromArray(array, {
    associatedWeights,
  });
  expect(result).toBe(1);
});

test("Float weights", () => {
  const array = [0, 1, 2, 3];
  const associatedWeights = normalize_to_max_coefficient([0.25, 25, 30, 1]);
  const pull = [] as number[];
  getRandomElementFromArray(array, {
    associatedWeights,
    filter: (item: number) => {
      pull.push(item);
      return false;
    },
  });

  const every = array.every((item) => pull.includes(item));
  expect(every).toBe(true);
});

test("Null weight", () => {
  const array = [0, 1, 2, 3, 4];
  const associatedWeights = normalize_to_max_coefficient([0.25, 25, 30, 1, 0]);
  const pull = [] as number[];
  getRandomElementFromArray(array, {
    associatedWeights,
    filter: (item: number) => {
      pull.push(item);
      return false;
    },
  });

  const without = array.slice(0, -1);
  const every = without.every((item) => pull.includes(item));
  expect(every).toBe(true);
});

test("Max safe integer weight", () => {
  const array = [0, 1, 2, 3, 4];
  const associatedWeights = normalize_to_max_coefficient([
    0.05,
    0.5,
    0.5,
    0.5,
    Number.MAX_SAFE_INTEGER,
  ]);
  const pull = [] as number[];
  getRandomElementFromArray(array, {
    associatedWeights,
    filter: (item: number) => {
      pull.push(item);
      return true;
    },
  });

  expect(pull).toStrictEqual([4]);
});

test("Empty", () => {
  const array: number[] = [];
  const associatedWeights = normalize_to_max_coefficient([]);

  expect(() =>
    getRandomElementFromArray(array, {
      associatedWeights,
    }),
  ).toThrow("Assertion: range must be positive");
});

test("v2", () => {
  const pull = resolve_attack_events_pull(context);
  const associatedWeights = normalize_to_max_coefficient(
    pull.map((base) => base._weight),
  );

  const randomizer = new RandomizerContext(pull, associatedWeights);
  for (let i = 0; i < attackContext.eventsCount; i++) {
    randomizer.pickRandom((pickContext) => {
      const { item } = pickContext;
      item.beforeCheck(item, pickContext);
      const passed = item.filter(item, pickContext);
      if (!passed) {
        return false;
      }
      if (item.repeats) {
        pickContext.busy_preventable.preventDefault();
      }
      return true;
    });
  }
});
