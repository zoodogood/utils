import assert from "node:assert";
import { binary_search } from "../primitives/binary_search.js";
import { create_default_preventable } from "../primitives/createDefaultPreventable.js";
import { BusyNumeric, size_of_area } from "./BusyNumeric.js";
import { getRandomNumberInRange } from "./getRandomNumberInRange.js";

interface IParams<T> {
	associatedWeights?: number[];
	filter?: (item: T) => boolean;
}

interface IPickContext<T> {
	busy_preventable: ReturnType<typeof create_default_preventable> & {
		require_insert(): void;
	};
	item: T;
	pick: (context: IPickContext<T>) => boolean;
	threshold: number;
	point: number;
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
	static from<T>({
		array,
		associatedWeights,
	}: {
		array: T[];
		associatedWeights?: IParams<T>["associatedWeights"];
	}) {
		const thresholds = associatedWeights && thresholdsOf(associatedWeights);
		return new RandomizerContext<T>(array, thresholds);
	}
	pickRandom(pick: IPickContext<T>["pick"] = () => true) {
		const { hotel, thresholds, array } = this;
		while (true) {
			const segments_count = hotel.segments_count();

			if (!segments_count) {
				break;
			}
			const target_of_free = getRandomNumberInRange({
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

			let _require_insert = false;
			const index = thresholds
				? pickInThresholds(thresholds, position)!
				: position;
			const element = array[index];
			const pickContext = {
				busy_preventable: {
					...create_default_preventable(),
					require_insert() {
						_require_insert = true;
					},
				},
				item: element,
				pick,
				threshold: index,
				point: position,
			} as IPickContext<T>;
			const picked = pick!(pickContext);
			if (
				_require_insert ||
				(!picked && !pickContext.busy_preventable.default_prevented())
			) {
				thresholds
					? hotel.insert_area(thresholds[index - 1] + 1 || 0, thresholds[index])
					: hotel.bifurcate(index);
			}
			if (picked) {
				return element;
			}
		}
		return undefined;
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

export function thresholdsOf(
	weights: NonNullable<IParams<unknown>["associatedWeights"]>,
) {
	assert(weights.length > 0, "Invalid array length");
	let previousLimit = 0;
	return weights.map((weight) => (previousLimit += weight)) as number[];
}

export function getRandomElementIndexInWeights(
	weights: NonNullable<IParams<unknown>["associatedWeights"]>,
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
export function getRandomElementFromArray<T>(
	array: T[],
	{ associatedWeights, filter = () => true }: IParams<T> = {},
) {
	assert(
		!associatedWeights || associatedWeights.length === array.length,
		"Incorrectly passed argument associatedWeights: The length of the associatedWeights must exactly match the length of the weights array",
	);

	return RandomizerContext.from<T>({
		array,
		associatedWeights,
	}).pickRandom(({ item }) => filter(item));
}
