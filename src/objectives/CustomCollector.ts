interface ICustomCollectorOptions {
	target: Required<{
		removeListener: CallableFunction;
		on: CallableFunction;
	}>;
	event: string;
	filter?: Function;
	time: number;
}

class CustomCollector {
	#callback?: CallableFunction;
	timeoutId?: NodeJS.Timeout;
	declare target: ICustomCollectorOptions["target"];
	declare event: ICustomCollectorOptions["event"];
	declare filter: ICustomCollectorOptions["filter"];
	declare time: ICustomCollectorOptions["time"];

	constructor({ target, event, filter, time = 0 }: ICustomCollectorOptions) {
		if ("on" in target === false) {
			throw new Error(
				"Target must be similar to EventEmitter.prototype — target haven't method 'on'"
			);
		}

		this.target = target;
		this.event = event;
		this.filter = filter;
		this.time = time;
	}

	setCallback(callback: CallableFunction) {
		const handler = (...params: any[]) => {
			const passed = !this.filter || this.filter(params);

			if (!!passed === true) {
				// @ts-ignore
				callback.apply(this, params);
			}
		};

		this.handle(handler);
	}

	handle(handler: CallableFunction) {
		this.end();

		this.#callback = handler;
		this.target.on(this.event, this.#callback);

		if (this.time > 0) {
			this.setTimeout(this.time);
		}
	}

	end() {
		if (this.timeoutId) {
			this.removeTimeout();
		}

		if (this.#callback) {
			this.target.removeListener(this.event, this.#callback);
		}
	}

	removeTimeout() {
		clearTimeout(this.timeoutId);
	}

	setTimeout(ms: number) {
		const callback = this.end.bind(this);
		this.timeoutId = setTimeout(callback, ms);
	}
}

export { CustomCollector };
