export class Accumulator<State, T> {
	#state: State
	constructor(
		public reduceFn: (acc: State, v: T) => State,
		initial: State,
	) {
		this.#state = initial
	}

	push(v: T) {
		this.#state = this.reduceFn(this.#state, v)
	}

	getState() {
		return this.#state
	}
}
