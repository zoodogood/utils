import { expect, test } from 'vitest'
import { justButtonComponents, justComponents } from './message_components'

test('Button', () => {
	expect(
		justComponents(
			justButtonComponents({
				label: 'test',
			}),
		),
	)
})
