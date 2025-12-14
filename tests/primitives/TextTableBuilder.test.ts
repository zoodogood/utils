import { expect, test } from 'vitest'
import {
	BorderDirectionEnum,
	CellAlignEnum,
	TextTableBuilder,
} from '../../src/primitives/TextTableBuilder.js'

test('Some ascii', () => {
	const EXPECTED_CONTENT = `
+-------+-----------+--------+
01.     |2/         |3/      0
+                            +
2   1      Пирожки      3    2
3             с              3
4           мясом            4
5    1  |        2  |     3  5
+-------+-----------+--------+
7  777  |    555    |  1999  7
^-------^-----------^--------^
`

	const builder = new TextTableBuilder()
		.setBorderOptions(
			({ metadata }, index) =>
				metadata.separatorsIndexesInRow!.includes(index) ? '+' : '-',
			[BorderDirectionEnum.BorderTop],
		)
		.setBorderOptions(
			(_, index) => String(index),
			[BorderDirectionEnum.BorderLeft, BorderDirectionEnum.BorderRight],
		)
		.addRowWithElements(['1.', '2/', '3/'], {
			align: CellAlignEnum.Left,
			gapLeft: 0,
		})
		.addRowSeparator(({ metadata }, index) =>
			index === 0 || index === metadata.tableWidth! - 1 ? '+' : ' ',
		)
		.addMultilineRowWithElements(['1', 'Пирожки\nс\nмясом', '3'], {
			align: CellAlignEnum.Center,
			removeNextSeparator: true,
		})
		.addRowWithElements(['1', '2', '3'], { align: CellAlignEnum.Right })
		.addRowSeparator(({ metadata }, index) =>
			metadata.separatorsIndexesInRow!.includes(index) ? '+' : '-',
		)
		.addRowWithElements(['777', '555', '1999'], { align: CellAlignEnum.Center })
		.addRowSeparator(({ metadata }, index) =>
			metadata.separatorsIndexesInRow!.includes(index) ? '^' : '-',
		)

	expect(builder.generateTextContent().trim()).toBe(EXPECTED_CONTENT.trim())
})

test('maxWidth', () => {
	const EXPECTED_CONTENT = `
|  Едааааа |  Пирож.. |  ААААА.. |
----------------------------------`

	const builder = new TextTableBuilder()
		.setBorderOptions()
		.addRowWithElements(
			['Едааааа', 'Пирожок с мясом', 'АААААААААААААА'],
			{},
			{
				maxWidth: 10,
			},
		)
		.addRowSeparator()

	expect(builder.generateTextContent().trim()).toBe(EXPECTED_CONTENT.trim())
})

test('minWidth', () => {
	const EXPECTED_CONTENT = `
|  1       |  2       |  3       |
----------------------------------`

	const builder = new TextTableBuilder()
		.setBorderOptions()
		.addRowWithElements(
			['1', '2', '3'],
			{},
			{
				minWidth: 10,
			},
		)
		.addRowSeparator()

	expect(builder.generateTextContent().trim()).toBe(EXPECTED_CONTENT.trim())
})

test('Different rows length', () => {
	const EXPECTED_CONTENT = `
|  1, 2, 3  |  2, 3  |  3  |     |
|  1, 2, 3  |  2, 3  |  3  |  4  |`

	const builder = new TextTableBuilder()
		.setBorderOptions()
		.addRowWithElements(['1, 2, 3', '2, 3', '3'])
		.addRowWithElements(['1, 2, 3', '2, 3', '3', '4'])

	expect(builder.generateTextContent().trim()).toBe(EXPECTED_CONTENT.trim())
})
