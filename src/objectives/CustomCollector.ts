interface ICustomCollectorOptions<EventParameters extends Array<unknown>> {
	target: Required<{
		removeListener: CallableFunction
		on: CallableFunction
	}>
	event: string
	filter?: (...param: EventParameters[]) => boolean
	time: number
}

class CustomCollector<EventParameters extends Array<unknown>> {
	#callback?: CallableFunction
	timeoutId?: NodeJS.Timeout
	declare target: ICustomCollectorOptions<EventParameters>['target']
	declare event: ICustomCollectorOptions<EventParameters>['event']
	declare filter: ICustomCollectorOptions<EventParameters>['filter']
	declare time: ICustomCollectorOptions<EventParameters>['time']

	constructor({
		target,
		event,
		filter,
		time = 0,
	}: ICustomCollectorOptions<EventParameters>) {
		if ('on' in target === false) {
			throw new Error(
				"Target must be similar to EventEmitter.prototype — target haven't method 'on'",
			)
		}

		this.target = target
		this.event = event
		this.filter = filter
		this.time = time
	}

	setCallback(callback: CallableFunction) {
		const handler = (...params: EventParameters) => {
			const passed = !this.filter || this.filter(params)

			if (!!passed === true) {
				// @ts-expect-error
				callback.apply(this, params)
			}
		}

		this.handle(handler)
	}

	handle(handler: CallableFunction) {
		this.end()

		this.#callback = handler
		this.target.on(this.event, this.#callback)

		if (this.time > 0) {
			this.setTimeout(this.time)
		}
	}

	end() {
		if (this.timeoutId) {
			this.removeTimeout()
		}

		if (this.#callback) {
			this.target.removeListener(this.event, this.#callback)
		}
	}

	removeTimeout() {
		clearTimeout(this.timeoutId)
	}

	setTimeout(ms: number) {
		const callback = this.end.bind(this)
		this.timeoutId = setTimeout(callback, ms)
	}
}

export { CustomCollector }
