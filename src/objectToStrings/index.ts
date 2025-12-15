export function objectToStrings<T>(
	o: Record<string, T>,
	formatFn: (k: string, v: T) => string,
): string[] {
	return Object.entries(o).map(([k, v]) => formatFn(k, v))
}
