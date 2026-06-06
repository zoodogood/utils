import { fs } from 'memfs'
import { expect, it } from 'vitest'
import { Aggregator } from './defineAggregator/Aggregator.js'
import { useAggregator } from './useAggregator.js'

it('customMetrix', async () => {
	// make file that aggregator will be found
	await fs.promises.writeFile('/agregate-me.q.ts', JSON.stringify(true))

	// initialize aggregator
	const aggregator = new Aggregator<
		boolean,
		{ found: number; results: boolean[]; sum: number },
		Record<string, unknown>
	>(
		'**/agregate-me.q.ts',
		async (path) => JSON.parse(String(await fs.promises.readFile(path))),
		(ctx) => {
			expect(ctx.matches[0].value).toBe(true)
			return {
				customMetrix: {
					found: ctx.matches.length,
					results: ctx.matches.map((x) => x.value),
					sum: ctx.matches.reduce((acc, x) => acc + Number(x.value), 0),
				},
				outfiles: {},
			}
		},
		{ agregation: { baseUrl: '/', fs }, flushOutfiles: false },
	)
	const { customMetrix } = await useAggregator(aggregator)
	expect(customMetrix).toStrictEqual({
		found: 1,
		results: [true],
		sum: 1,
	})
})

it('outfile', async () => {
	// make file that aggregator will be found
	await fs.promises.writeFile('/agregate-me.q.ts', JSON.stringify(true))

	// initialize aggregator
	const aggregator = new Aggregator<
		boolean,
		object,
		Record<
			string,
			{
				path: string
				value: boolean
			}[]
		>
	>(
		'**/agregate-me.q.ts',
		async (path) => JSON.parse(String(await fs.promises.readFile(path))),
		(ctx) => {
			expect(ctx.matches[0].value).toBe(true)
			return {
				customMetrix: {},
				outfiles: {
					'./compiled': ctx.matches,
				},
			}
		},
		{
			agregation: { baseUrl: '/', fs },
			flushOutfiles: { dir: '/_out', fs, cleandir: false },
		},
	)
	await useAggregator(aggregator)
	expect(
		JSON.parse(String(await fs.promises.readFile('/_out/compiled'))),
	).toStrictEqual([{ path: '/agregate-me.q.ts', value: true }])
})
