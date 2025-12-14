export * from './BracketsParser.js'
export * from './binary_search.js'
export { CliParser } from './CliParser.js'
export * from './createDefaultPreventable.js'
export * from './normalize.js'
export * from './pluralization/index.js'
export * from './symbols.js'
export * from './TextTableBuilder.js'

export function sortMutByResolve<T>(
	array: T[],
	resolve: ($: T) => number,
	{ reverse }: { reverse?: boolean } = {},
) {
	return reverse
		? array.sort((a, b) => resolve(a) - resolve(b))
		: array.sort((a, b) => resolve(b) - resolve(a))
}

export function arrayEmpty<T>(array: Array<T>) {
	array.splice(0, array.length)
	return array
}

export function arraySpliceItem<T>(array: T[], searchElement: T) {
	const index = array.indexOf(searchElement)
	if (index === -1) {
		return false
	}
	array.splice(index, 1)
	return true
}
