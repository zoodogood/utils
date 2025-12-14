import { expect, test } from 'vitest'
import { DotNotatedInterface } from './DotNotatedInterface.js'

test('Get array value; Set not exists value by callback', () => {
	const target = {
		parent: {
			nested: [true],
		},
		beRemoved: 0,
	}

	const _interface = new DotNotatedInterface(target)

	expect(_interface.getItem('parent.nested.0')).toBe(true)

	expect(
		_interface.updateItem(
			'parent.numbers.y',
			(value: number) => (value || 0) + 5,
		),
	).toBe(5)
})

test('Get not exists; Check exists; Remove item', () => {
	const target = {
		parent: {
			nested: [true],
		},
		beRemoved: 0,
	}

	const _interface = new DotNotatedInterface(target)

	expect(_interface.getItem('notexists')).toBe(null)

	expect(_interface.hasItem('beRemoved')).toBe(true)
	expect(_interface.removeItem('beRemoved')).toBe(true)
	expect(_interface.hasItem('beRemoved')).toBe(false)

	expect(_interface.hasItem('exists')).toBe(false)
})
