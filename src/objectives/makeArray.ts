export function makeArray<T>(mapFn: (a: number) => T, length: number): T[] {
	return Array.from({ length }, (_, i) => mapFn(i)) as T[]
}
