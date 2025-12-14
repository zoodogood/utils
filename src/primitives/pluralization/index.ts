// MARK: Ending
interface IEndingOptions {
	unite?: (quantity: number, word: string) => string
}
export function ending(
	quantity: number,
	base: string,
	multiple: string,
	alone: string,
	double: string,
	options: IEndingOptions = {},
) {
	if (Number.isNaN(+quantity)) {
		return Number.NaN
	}

	// Закономерность чисел 10-20, 110-120...
	const _clean_quantity = quantity % 100 < 20 ? quantity % 20 : quantity % 10

	const end =
		_clean_quantity >= 5 || _clean_quantity === 0
			? multiple
			: _clean_quantity > 1
				? double
				: alone
	const word = base + end

	options.unite ||= (quantity, word) => `${quantity} ${word}`

	const input = options.unite(quantity, word)
	return input
}

// MARK: Plularization
export enum GrammaticGender {
	He = 0,
	She = 1,
	It = 2,
}
export function pluralization_of_numeric(
	quantity: number,
	grammatic_gender: GrammaticGender,
	pattern: string[],
) {
	return ending(Math.abs(quantity), '', pattern[0], pattern[1], pattern[2], {
		unite: (_, word) =>
			word.replace('{}', pluralize_numeric_form(quantity, grammatic_gender)),
	})
}

export function pluralize_numeric_form(
	quantity: number,
	grammatic_gender: GrammaticGender,
): string {
	if (quantity === 0) {
		return 'ноль'
	}
	let _result = ''
	if (quantity < 0) {
		quantity = -quantity
		_result += 'минус '
	}

	if (quantity >= 1_000_000) return String(quantity)

	if (quantity >= 1_000) {
		const x = Math.floor(quantity / 1_000)
		_result += ending(x, 'тысяч', '', 'а', 'и', {
			unite: (_, word) => `${count_of_bit(x, GrammaticGender.She)} ${word} `,
		})
		quantity -= x * 1_000
	}

	if (quantity >= 1) {
		_result += `${count_of_bit(quantity, grammatic_gender)} `
	}

	return _result.trimEnd()

	function count_of_bit(value: number, grammatic_gender: GrammaticGender) {
		let _result = ''

		if (value >= 100) {
			const x = Math.floor(value / 100)
			_result += `${
				[
					'сто',
					'двести',
					'триста',
					'четыреста',
					'пятьсот',
					'шестьсот',
					'семьсот',
					'восемьсот',
					'девятьсот',
				][x - 1]
			} `
			value -= x * 100
		}

		if (value >= 20) {
			const x = Math.floor(value / 10)
			_result += `${
				[
					'двадцать',
					'тридцать',
					'сорок',
					'пятьдесят',
					'шестдесят',
					'семдесят',
					'восемьдесят',
					'девяносто',
				][x - 2]
			} `
			value -= x * 10
		}

		if (value >= 1) {
			_result += [
				['один', 'одна', 'одно'][grammatic_gender],
				['два', 'две', 'два'][grammatic_gender],
				'три',
				'четыре',
				'пять',
				'шесть',
				'семь',
				'восемь',
				'девять',
				'десять',
				'одинадцать',
				'двенадцать',
				'тринадцать',
				'четырнадцать',
				'пятьнадцать',
				'шестнадцать',
				'семнадцать',
				'восемнадцать',
				'девятнадцать',
			][value - 1]
		}
		return _result.trimEnd()
	}
}
