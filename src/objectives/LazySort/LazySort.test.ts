import { describe, expect, test } from 'vitest'
import { LazySort } from './LazySort.build.js'

describe('LazySortEntry.splice', () => {
	test('Splice removes and inserts elements correctly', () => {
		const source = LazySort.ofNumbers([
			5, 1, 3, 4, 2, 17, 11, 10, 9, 15, 14, 16, 13, 12, 7, 8, 6, 199,
		])
		const entry = source.entry()

		// Проверка начального состояния
		expect(source.length).toBe(18)
		expect(entry.toArray().map(([value]) => value)).toEqual([
			1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 199,
		])

		// Удаление элементов
		const removed = entry.splice(5, 3) // Удаляем элементы с 6-й по 8-й (0-индексация)
		expect(removed.map(([value]) => value)).toEqual([6, 7, 8])

		// Проверяем обновленное состояние
		expect(source.length).toBe(15)
		expect(entry.toArray().map(([value]) => value)).toEqual([
			1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14, 15, 16, 17, 199,
		])

		// Вставка элементов

		entry.splice(2, 0, [99, 99], [98, 98]) // Вставляем два элемента после второго

		expect(source.length).toBe(17)
		expect(entry.toArray().map(([value]) => value)).toEqual([
			1, 2, 99, 98, 3, 4, 5, 9, 10, 11, 12, 13, 14, 15, 16, 17, 199,
		])

		// Удаление и замена
		// 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
		const replaced = entry.splice(9, 2, [77, 77])
		expect(replaced.map(([value]) => value)).toEqual([11, 12])
		expect(source.length).toBe(16)
		expect(entry.toArray().map(([value]) => value)).toEqual([
			1, 2, 99, 98, 3, 4, 5, 9, 10, 77, 13, 14, 15, 16, 17, 199,
		])
	})

	test('Chunk with 199 remains unchanged', () => {
		const source = LazySort.ofNumbers([
			5, 1, 3, 4, 2, 17, 11, 10, 9, 15, 14, 16, 13, 12, 7, 8, 6, 199,
		])
		const entry = source.entry()

		// Проверяем, что чанк с элементом 199 еще не был просчитан
		const chunkWith199Index = source.chunks!.findIndex((chunk) =>
			chunk.iterable.some(([value]) => value === 199),
		)

		expect(chunkWith199Index).not.toBe(-1) // Чанк должен существовать

		const chunkWith199 = source.chunks![chunkWith199Index]

		// Убеждаемся, что чанк не просчитан
		expect(chunkWith199.calculated).toBe(false)

		// Выполняем операцию, которая не должна затрагивать чанк с 199

		entry.splice(5, 3)
		// Убедимся, что чанк с 199 остался непросчитанным
		expect(chunkWith199.calculated).toBe(false)

		// Проверяем, что сам чанк не изменился
		expect(chunkWith199.iterable.some(([value]) => value === 199)).toBe(true)
		entry.splice(-1, 0, [200, 200])
		expect(chunkWith199.calculated).toBe(true)
	})

	test('Reverse', () => {
		const iterable = [
			5, 1, 3, 4, 2, 17, 11, 10, 9, 15, 14, 16, 13, 12, 7, 8, 6, 199,
		].map(($) => [$, $] as [number, number])
		const source = new LazySort(iterable, {
			revert: true,
		})

		const result = source.entry().toArray()

		expect(result.map(([value]) => value)).toEqual([
			199, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
		])
	})

	test('mediana', () => {
		const iterable = [
			5, 1, 3, 4, 2, 17, 11, 10, 9, 15, 14, 16, 13, 12, 7, 8, 6, 199,
		]
		const source = LazySort.ofNumbers(iterable)
		const [mediana] = source.entry().at(Math.floor(iterable.length / 2))!
		expect(mediana).toBe(10)
	})

	test('All zeros', () => {
		const source = LazySort.ofNumbers(new Array(30).fill(0))
		const entry = source.entry()
		expect(entry.toArray().map(([value]) => value)).toEqual(
			new Array(30).fill(0),
		)
	})

	test('Incorrect input', () => {
		const source = LazySort.ofNumbers(
			// @ts-expect-error
			Array.from(new Array(30), () => ({ messages: 0 })),
		)
		expect(() => source.entry()).toThrow()
	})
})
