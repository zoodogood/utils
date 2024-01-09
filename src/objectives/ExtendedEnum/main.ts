import { deepEqual, checkProperiesExistsOrEqual } from "../equal.js";

export class BaseExtendedEnumPartial<T = undefined> {
  static value = 1;
  static from(data: object) {
    return Object.assign(Object.create(this.prototype), data);
  }

  #props?: T;

  get props(): T | undefined {
    return this.#props;
  }

  set props(props: T) {
    this.#props = props;
  }

  constructor(props: T) {
    this.props = props;
  }

  includes(props: T) {
    return props !== null && typeof props === "object"
      ? checkProperiesExistsOrEqual(
          props,
          this.props as { [key: string]: unknown },
        )
      : this.props === props;
  }

  some(props: T) {
    return deepEqual(this.props, props);
  }

  is(constructor: typeof BaseExtendedEnumPartial) {
    return this instanceof constructor;
  }

  toBoolean() {
    const constructor = this.constructor as typeof BaseExtendedEnumPartial;
    return Boolean(constructor.value);
  }

  unwrap() {
    return this.expect();
  }

  expect(message?: string) {
    if (!this.toBoolean()) {
      throw new Error(message);
    }
    return this.props;
  }
}

export class BaseExtendedEnum {
  static is(
    instance: BaseExtendedEnumPartial<unknown>,
    constructor: typeof BaseExtendedEnumPartial,
  ) {
    return instance instanceof constructor;
  }
}
