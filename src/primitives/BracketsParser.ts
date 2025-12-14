type TCompareSequence = string | RegExp

interface IBracketVariant {
	key: string
	start: TCompareSequence
	end: TCompareSequence
	isRegex?: boolean
	isSequence?: boolean
}

class StackElement {
	indexInText?: number
	isRegex = false
	match = null
	key?: string
	full?: string
	variant?: IBracketVariant

	get length() {
		return this.full?.length
	}

	static from(data: unknown) {
		return Object.assign(new StackElement(), data)
	}
}

class GroupElement {
	start?: StackElement
	end?: StackElement
	content?: string
	subgroups: GroupElement[] = []
	depth = 0

	get key() {
		return this.start?.key
	}

	get indexInText() {
		return this.start?.indexInText
	}

	get length(): number {
		return (
			// @ts-expect-error May be undefined
			this.end?.indexInText - this.start?.indexInText + this.end?.full?.length
		)
	}

	get full(): string | null {
		// @ts-expect-error May be undefined
		return this.start?.full + this.content + this.end?.full || null
	}

	isParentFor(group: GroupElement) {
		const { start: targetStart, end: targetEnd } = group
		return (
			// @ts-expect-error Maybe null
			this.start.indexInText < targetStart.indexInText &&
			// @ts-expect-error Maybe null
			this.end.indexInText > targetEnd.indexInText
		)
	}

	static from(data: unknown) {
		return Object.assign(new GroupElement(), data)
	}
}

class ParseContext {
	stack: StackElement[] = []
	indexInText = 0
	text?: string
	groups: Array<GroupElement> = []
	setText(text: string) {
		this.text = text
	}
	appendGroup(group: GroupElement) {
		this.groups.push(group)
	}
}

export class BracketsParser {
	variants = new Map<string, IBracketVariant>()
	addBracketVariant(...variants: IBracketVariant[]) {
		for (const variant of variants) {
			const { key } = variant
			this.variants.set(key, variant)
		}
		return this
	}

	setBracketVariant(...variants: IBracketVariant[]) {
		;[...this.variants.keys()].forEach((key) => {
			this.variants.delete(key)
		})
		this.addBracketVariant(...variants)
		return this
	}

	processSymbol(symbol: string, context: ParseContext) {
		this.processSlash(symbol, context)
		this.processBracket(symbol, context)
	}

	processBracket(symbol: string, context: ParseContext) {
		this.processBracketClose(symbol, context) ||
			this.processBracketOpen(symbol, context)
	}

	processBracketClose(symbol: string, context: ParseContext) {
		if (!context.stack.length) {
			return
		}

		const { key } = context.stack.at(-1)!
		const variant = this.variants.get(key!)

		const match = variant!.isSequence
			? this.sequenceCaptureProtocol(variant!.end, context)
			: this.symbolCaptureProtocol(symbol, variant!.end, context)

		if (!match) {
			return
		}

		const start = context.stack.pop()!
		const end = StackElement.from({ ...match, key: variant!.key, variant })
		const group = this._createGroup(start, end, context)
		context.appendGroup(group)
		return end
	}

	_createGroup(start: StackElement, end: StackElement, context: ParseContext) {
		const content = context.text!.slice(
			start.indexInText! + start.length!,
			end.indexInText,
		)
		const group = GroupElement.from({ start, end, content })
		const potentialChild = context.groups.at(-1)

		if (potentialChild && group.isParentFor(potentialChild)) {
			group.subgroups.push(potentialChild)
		}

		group.depth = context.stack.length
		return group
	}

	processBracketOpen(symbol: string, context: ParseContext) {
		const result = (() => {
			for (const variant of this.variants.values()) {
				const match = variant.isSequence
					? this.sequenceCaptureProtocol(variant.start, context)
					: this.symbolCaptureProtocol(symbol, variant.start, context)

				if (match) {
					return { match, variant }
				}
			}
		})()

		if (!result) {
			return null
		}

		const { match, variant } = result
		const start = StackElement.from({ ...match, key: variant.key, variant })
		context.stack.push(start)
		return start
	}

	/**
	 * @note Regular sequences of expressions must starts with ^
	 */
	sequenceCaptureProtocol(compare: TCompareSequence, context: ParseContext) {
		const indexInText = context.indexInText
		const target = context.text!.slice(indexInText)
		const isRegex = compare instanceof RegExp
		const match = isRegex ? target.match(compare) : target.startsWith(compare)

		if (!match) {
			return null
		}
		const full = (isRegex ? (match as RegExpMatchArray)[0] : compare) as string
		context.indexInText += full.length - 1
		return { match, isRegex, full, indexInText }
	}

	symbolCaptureProtocol(
		symbol: string,
		compare: TCompareSequence,
		context: ParseContext,
	) {
		const indexInText = context.indexInText
		const isRegex = compare instanceof RegExp
		const match = isRegex ? symbol.match(compare) : symbol === compare

		if (!match) {
			return null
		}
		const full = symbol
		return { match, isRegex, full, indexInText }
	}

	processSlash(symbol: string, context: ParseContext) {
		if (symbol !== '\\') {
			return
		}
		context.indexInText++
	}

	parse(text: string) {
		const context = new ParseContext()
		context.setText(text)

		while (true) {
			const index = context.indexInText
			const symbol = text[index] || ''
			this.processSymbol(symbol, context)
			if (symbol === '') {
				break
			}
			context.indexInText++
		}
		return context
	}

	static ParseContext = ParseContext
	static GroupElement = GroupElement
	static StackElement = StackElement
	static get defaultBracketVariants() {
		return [
			{
				key: '{}',
				start: '{',
				end: '}',
			},
			{
				key: '[]',
				start: '[',
				end: ']',
			},
			{
				key: '()',
				start: '(',
				end: ')',
			},
			{
				key: '""',
				start: '"',
				end: '"',
			},
			{
				key: "''",
				start: "'",
				end: "'",
			},
		]
	}
}
