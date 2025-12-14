import { expect, test } from 'vitest'
import { BracketsParser } from '../../src/primitives/BracketsParser.js'

test('Nested groups', () => {
	const text = '({}[{"nested"}])'
	const parser = new BracketsParser()
	const result = parser
		.addBracketVariant(...BracketsParser.defaultBracketVariants)
		.parse(text)

	expect(result.groups).toHaveLength(5)
})
