import assert from "node:assert";
import { binary_search } from "../primitives/binary_search.js";
import { BusyNumeric, size_of_area } from "./BusyNumeric.js";
import { randomNumberInRange } from "./randomNumberInRange.js";

export const _WEIGHT_AUTO = 1_000_001;
interface IParams<T> {
	associatedWeights?: number[] | typeof _WEIGHT_AUTO;
	filter?: (item: T) => boolean;
}

interface IPickContext<T> {
	item: T;
	pick: (context: IPickContext<T>) => boolean;
	threshold: number;
	point: number;
	index_of_item: number;
}

interface ILotteryContext {
	index_of_item: number;
	point: number;
	remove_current_from_pull(): void;
}

export class RandomizerContext<T> {
	hotel: BusyNumeric;
	array: T[];
	thresholds?: number[];
	constructor(array: T[], thresholds?: number[]) {
		this.array = array;
		this.thresholds = thresholds;
		const range = thresholds?.at(-1) ?? array.length - 1;
		this.hotel = new BusyNumeric(range);
	}

	/* Add to your code
	if (associatedWeights === AUTO) {
			// @ts-expect-error User known about AUTO keyword
			associatedWeights = array.map(($) => $._weight);
	}
	associatedWeights?.length && assert(associatedWeights.at(-1)! < Number.MAX_SAFE_INTEGER)
	*/
	static from<T>({
		array,
		associatedWeights,
	}: {
		array: T[];
		associatedWeights?: number[];
	}) {
		const thresholds = associatedWeights && thresholdsOf(associatedWeights);
		return new RandomizerContext<T>(array, thresholds);
	}
	pickRandom(pick: IPickContext<T>["pick"] = () => true): T | undefined {
		const { hotel, thresholds, array } = this;
		while (true) {
			const segments_count = hotel.segments_count();

			if (!segments_count) {
				break;
			}
			const target_of_free = randomNumberInRange({
				max: hotel.free_area - 1,
			});
			const position = (() => {
				let segment = 0;
				let distance = target_of_free;
				let position = 0;
				while (true) {
					const free_area =
						(hotel.busy_areas[segment]?.[0] ?? hotel.range + 1) -
						(hotel.busy_areas[segment - 1]?.[1] ?? -1) -
						1;
					distance -= free_area;
					position += free_area;
					if (distance < 0) {
						return position + distance;
					}
					position += size_of_area(
						hotel.busy_areas[segment] || [0, hotel.range + 1],
					);
					segment++;
				}
			})();

			const index = thresholds
				? pickInThresholds(thresholds, position)!
				: position;
			const element = array[index];
			const pickContext = {
				item: element,
				index_of_item: index,
				pick,
				threshold: index,
				point: position,
			} as IPickContext<T>;
			const picked = pick!(pickContext);
			if (picked) {
				return element;
			}
			thresholds
				? hotel.insert_area(thresholds[index - 1] + 1 || 0, thresholds[index])
				: hotel.bifurcate(index);
		}
		return undefined;
	}

	playLottery(): ILotteryContext | undefined {
		const { hotel, thresholds } = this;
		while (true) {
			const segments_count = hotel.segments_count();
			if (!segments_count) {
				break;
			}
			const target_of_free = randomNumberInRange({
				max: hotel.free_area - 1,
			});
			const position = (() => {
				let segment = 0;
				let distance = target_of_free;
				let position = 0;
				while (true) {
					const free_area =
						(hotel.busy_areas[segment]?.[0] ?? hotel.range + 1) -
						(hotel.busy_areas[segment - 1]?.[1] ?? -1) -
						1;
					distance -= free_area;
					position += free_area;
					if (distance < 0) {
						return position + distance;
					}
					position += size_of_area(
						hotel.busy_areas[segment] || [0, hotel.range + 1],
					);
					segment++;
				}
			})();

			const index = thresholds
				? pickInThresholds(thresholds, position)!
				: position;
			const lotteryContext = {
				index_of_item: index,
				point: position,
				remove_current_from_pull() {
					thresholds
						? hotel.insert_area(
								thresholds[index - 1] + 1 || 0,
								thresholds[index],
							)
						: hotel.bifurcate(index);
				},
			} as ILotteryContext;
			return lotteryContext;
		}
	}
}

export function pickInThresholds(thresholds: number[], value: number): number {
	assert(thresholds.length > 0);
	return binary_search(thresholds.length - 1, (index: number) => {
		const hold = thresholds[index];
		if (hold >= value && (thresholds[index - 1] ?? -1) < value) {
			return 0;
		}
		if (hold < value) {
			return -1;
		}
		return 1;
	});
}

export function thresholdsOf(weights: NonNullable<number[]>) {
	assert(weights.length > 0, "Invalid array length");
	let previousLimit = 0;
	return weights.map((weight) => (previousLimit += weight)) as number[];
}

export function randomElementIndexInWeights(
	weights: NonNullable<number[]>,
): number | never {
	const thresholds = thresholdsOf(weights);

	const lotteryPick = Math.random() * thresholds.at(-1)!;
	return pickInThresholds(thresholds, lotteryPick)!;
}

// task: честный алгоритм , для которого каждый из элеметов списка имеет равный шанс на реализацию своей вероятности.
// Обычно весь список фильтруется и после выбирается элемент. В нашем случае фильтр будет срабатывать только для тех элементов,
// которые на этапе фильтрации «выбраны» — то есть имеют свою стопроцентную вероятность быть окончательными после успешного прохождения фильтра
// требования: честная вероятность; итоговая производительность должна быть выше обычной при проходе списка фильтром
// Алгоритм:
/*
  Оптимальный алгоритм поиска случайного элемента списка, удовлетворяющего условию. Поддерживается возможность задавать элементам коэффициент вероятности 

  Перед выбором элемента выбираем случайный сегмент, далее случайный элемент в этом сегменте

  Если соответствует условию, возвращаем элемент. Завершаем поиск

  Иначе исключаем элемент путем раздвоения текущего сегмента так, чтобы элемент не оказался ни в одном сегменте списка

  Повторяем 
  */
export function randomElementFromArray<T>(
	array: T[],
	{ associatedWeights, filter = () => true }: IParams<T> = {},
) {
	assert(array.length, "Invalid array length");
	if (associatedWeights === _WEIGHT_AUTO) {
		// @ts-expect-error User know about AUTO keysymbol
		associatedWeights = array.map(($) => $._weight);
	}
	associatedWeights?.length &&
		assert(associatedWeights.at(-1)! < Number.MAX_SAFE_INTEGER);

	assert(
		!associatedWeights || associatedWeights.length === array.length,
		"Incorrectly passed argument associatedWeights: The length of the associatedWeights must exactly match the length of the weights array",
	);

	if (array.length === 1) {
		return array[0];
	}
	// light strategy
	if (!filter) {
		if (associatedWeights) {
			return array[randomElementIndexInWeights(associatedWeights)];
		}
		return array[Math.floor(Math.random() * array.length)];
	}

	return RandomizerContext.from<T>({
		array,
		associatedWeights,
	}).pickRandom(({ item }) => filter(item));
}

export function randomElementsFromArray<T>(
	array: T[],
	amount = 1,
	{ associatedWeights, filter = () => true }: IParams<T> = {},
) {
	assert(array.length);
	assert(amount <= array.length);
	assert(
		amount > 1,
		`Current amount: ${amount}, use randomElementFromArray instead of randomElement**s**FromArray if amount is 1`,
	);
	if (associatedWeights === _WEIGHT_AUTO) {
		// @ts-expect-error User know about AUTO keysymbol
		associatedWeights = array.map(($) => $._weight);
	}
	associatedWeights?.length &&
		assert(associatedWeights.at(-1)! < Number.MAX_SAFE_INTEGER);

	assert(
		!associatedWeights || associatedWeights.length === array.length,
		"Incorrectly passed argument associatedWeights: The length of the associatedWeights must exactly match the length of the weights array",
	);
	if (amount === array.length) {
		return Array.from(array);
	}
	// light strategy
	if (!filter && !associatedWeights) {
		const _array = Array.from(array);
		return Array.from(
			{ length: amount },
			() => _array.splice(Math.floor(Math.random() * _array.length), 1)[0],
		);
	}
	const random_ctx = RandomizerContext.from<T>({
		array,
		associatedWeights,
	});
	return Array.from({ length: amount }, (_, i) => {
		while (true) {
			const lottery_ctx = random_ctx.playLottery();
			if (!lottery_ctx) {
				// BEFORE PULL TO-DO вероятно неграммотное сообщение об ошибке
				throw new Error("Not enought items was pass filter");
			}
			lottery_ctx.remove_current_from_pull();
			const item = array[lottery_ctx.index_of_item];
			if (!filter(item)) {
				continue;
			}
			return item;
		}
	});
}
