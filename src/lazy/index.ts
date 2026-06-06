/**
 *
 * @deprecated since v8.1.0; use useLazy() instead
 */
export function lazy<T>(initializer: () => T): () => T {
	let _value: T
	return () => (_value ||= initializer())
}
