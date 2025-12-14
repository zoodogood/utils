import { expect, test } from 'vitest'
import * as Util from '../../src/discordjs/mod'

test('Should return true for an empty embed', () => {
	const emptyEmbed = Util.createMessage({ reference: '0000000000000000' })
	expect(Util.isEmptyEmbed(emptyEmbed)).toBe(true)
})

test('Create message.', () => {
	const message = Util.createMessage({
		content: '123',
	})

	expect(message.content).toBe('123')
})
