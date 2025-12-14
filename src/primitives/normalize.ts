export function normalize_to_max_coefficient(list: number[]) {
	// normalize_to_optimal(2, MAX_SAFE_INTEGER) will be coefficient 1:9007199254740990
	// normalize_to_optimal(0.25, 3000) will be coefficient 750537393112:9006448717347879
	const sum = list.reduce((acc, value) => acc + value, 0)
	const multiplayer = Number.MAX_SAFE_INTEGER / sum
	return list.map((x) => Math.floor(x * multiplayer))
}
