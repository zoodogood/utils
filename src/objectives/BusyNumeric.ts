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

import { binary_search } from "../primitives/binary_search.js";

/**
 * MARK: Представьте отель
 * Часть его номеров свободны, а часть — заняты
 * Есть две особенности.
 * 1) При заселении ищется случайный номер
 * 2) Хотя у нас есть список занятых номеров, у нас не может быть списка свободных (за условием задачи)
 * Этот алгоритм используется для эффективного поиска тех самых свободных номеров, которые удовлетворяют заданному условию
 */

// Убежден что в алгоритме список busy_areas можно применить структуру бинарных деревьев.
// Если основное количество производительности не реализуется из-за особенностей структуры списка, то это можно оптимизировать
// Интересно что ветки дерева можно определять по индексу. Да, это интересное замечание.

// В BusyNumeric можно добавить ещё метод separate

export class BusyNumeric {
  readonly range: number;
  readonly busy_areas: (readonly [number, number])[] = [];
  #peak_start_busy = false;
  get peak_start_busy() {
    if (this.#peak_start_busy) {
      return true;
    }
    if (this.busy_areas[0]?.[0] !== 0) {
      return false;
    }
    this.#peak_start_busy = true;
    return true;
  }
  #peak_end_busy = false;
  get peak_end_busy() {
    if (this.#peak_end_busy) {
      return true;
    }
    if (this.busy_areas.at(-1)?.[1] !== this.range) {
      return false;
    }
    this.#peak_end_busy = true;
    return true;
  }
  constructor(range: number) {
    if (range <= 0) {
      throw new Error("Assertion: range must be positive");
    }
    this.range = range;
  }

  bifurcate(point: number) {
    this.insert_area(point, point);
  }

  segments_count() {
    return (
      this.busy_areas.length + 1 - +this.peak_start_busy - +this.peak_end_busy
    );
  }

  segment(at: number) {
    if (!this.range) {
      return undefined;
    }
    const { peak_start_busy, peak_end_busy } = this;
    const segments_count = this.segments_count();

    if (at < 0) {
      if (segments_count + at < 0) {
        return undefined;
      }
      at = segments_count + at;
    }

    if (peak_start_busy) {
      at += 1;
    }

    if (peak_end_busy && at > segments_count) {
      return undefined;
    }

    if (at > segments_count + 1) {
      return undefined;
    }

    const left = this.busy_areas[at - 1];
    const right = this.busy_areas[at];

    // formula: busy_area_point ± 1 (jump to segment)
    const start = left?.[1] + 1 || 0;
    const end = right ? right[0] - 1 : this.range;

    const size = end - start + 1;
    return { size, left, right };
  }

  insert_area(start: number, end: number) {
    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      throw new Error(
        `Assertion error: start or end not integer ${start} ${end}, maybe float?`,
      );
    }
    if (start > end) {
      [start, end] = [end, start];
    }
    if (start < 0) {
      throw new Error("Assertion error: start < 0");
    }
    if (end > this.range) {
      throw new Error("Assertion error: end > this.range");
    }

    const place_index =
      binary_search(this.busy_areas.length - 1, (index: number) => {
        const value = this.busy_areas[index]?.[1];
        const biggest = end < value;
        if (biggest) {
          return 1;
        }
        return (
          +(
            (this.busy_areas[index + 1]?.[1] ?? Number.MAX_SAFE_INTEGER) > end
          ) - 1
        );
      }) + 1;

    const left = this.busy_areas[place_index - 1];
    const right = this.busy_areas[place_index];

    const is_left_included = !!left && left[1] + 1 >= start;
    const is_right_included = !!right && right[0] - 1 <= end;

    // Merge strategy 3
    if (is_left_included && is_right_included) {
      this.busy_areas.splice(place_index - 1, 2, [left[0], right[1]]);
      return;
    }

    // Merge strategy 2
    if (is_left_included || is_right_included) {
      const target = is_left_included ? left : right;
      const [index, points]: [number, readonly [number, number]] =
        is_left_included
          ? [place_index - 1, [target[0], end]]
          : [place_index, [start, target[1]]];

      if (target[0] <= start && target[1] >= end) {
        throw new Error("Assertion error: [start, end] in range");
      }

      this.busy_areas.splice(index, 1, points);
      return;
    }

    // Merge strategy 1
    this.busy_areas.splice(place_index, 0, [start, end]);
  }

  refresh = {
    _areas: () => (this.busy_areas.length = 0),
    _peak: () => {
      this.#peak_start_busy = false;
      this.#peak_end_busy = false;
    },
    full: () => {
      this.refresh._areas();
      this.refresh._peak();
    },
  };
}
