import { expect, test } from 'vitest';
import { GrammaticGender, pluralization_of_numeric } from '.';

test("Plularization", () => {
	expect(pluralization_of_numeric(
		122, GrammaticGender.She, [
			"{} клубник",
			"{} клубника",
			"{} клубники"
		]
	)).toBe("сто двадцать две клубники")

	expect(pluralization_of_numeric(
		919, GrammaticGender.She, [
			"{} клубник",
			"{} клубника",
			"{} клубники"
		]
	)).toBe("девятьсот девятнадцать клубник")

	expect(pluralization_of_numeric(
		999_999, GrammaticGender.She, [
			"{} клубник",
			"{} клубника",
			"{} клубники"
		]
	)).toBe("девятьсот девяносто девять тысяч девятьсот девяносто девять клубник")

	expect(pluralization_of_numeric(
		1001, GrammaticGender.She, [
			"{} клубник",
			"{} клубника",
			"{} клубники"
		]
	)).toBe("одна тысяча одна клубника")

	expect(pluralization_of_numeric(-22, GrammaticGender.It, [
		"{} солнц",
		"{} солнце",
		"{} солнца"
	])).toBe("минус двадцать два солнца")
})
