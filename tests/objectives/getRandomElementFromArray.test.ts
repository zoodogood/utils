import { expect, test } from "vitest";
import {
	RandomizerContext,
	_WEIGHT_AUTO,
	getRandomElementFromArray,
	getRandomElementsFromArray,
	thresholdsOf
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
	const associatedWeights = normalize_to_max_coefficient([0.5, 25, 30, 1]);
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
	).toThrow("Invalid array length");
});

test("Repeats system", () => {
	const ONCE_VALUE = Number.MAX_SAFE_INTEGER;
	const REPEATED_VALUE = 2;
	
	const items = [ONCE_VALUE, REPEATED_VALUE];
	const associatedWeights = normalize_to_max_coefficient(items);
	
	
	const _returned = [] as number[];
	const randomizer = new RandomizerContext(items, thresholdsOf(associatedWeights));
	for (let i = 0; i < 10; i++) {
		const lottery_ctx = randomizer.playLottery()!;
		const item = items[lottery_ctx.index_of_item];
		const repeats = item === REPEATED_VALUE;
		if (!repeats) {
			lottery_ctx.remove_current_from_pull();
		}
		_returned.push(item);
	}
		
	
	expect(_returned.filter((item) => item === ONCE_VALUE).length).toBe(1);
	expect(_returned.filter((item) => item === REPEATED_VALUE).length).toBe(9);
});

test("Auto keysymbol", () => {
	const items = [
		{ value: 1, _weight: Number.MAX_SAFE_INTEGER - 2 },
		{
			value: 2,
			_weight: 1,
		},
	];
	expect(
		getRandomElementFromArray(items, { associatedWeights: _WEIGHT_AUTO })!.value,
	).toBe(1);
});

test("Never pick ends with undefined", () => {
	const array = [1, 2, 3, 4, 5, 6, 7, 8];
	expect(
		RandomizerContext.from({ array, associatedWeights: array }).pickRandom(
			() => false,
		),
	).toBe(undefined);
});

test("Amount system", () => {
	const array = [1, 2, 3, 4, 5, 6, 7, 8];
	expect(getRandomElementsFromArray(array, 3)).toHaveLength(3);
	expect(array).toHaveLength(8);

	expect((getRandomElementsFromArray(array, 3, {
			associatedWeights: normalize_to_max_coefficient([
				Number.MAX_SAFE_INTEGER,
				Number.MAX_SAFE_INTEGER,
				Number.MAX_SAFE_INTEGER,
				1,
				1,
				1,
				1,
				1,
			]),
		})).toSorted()).toStrictEqual([1, 2, 3])
});
