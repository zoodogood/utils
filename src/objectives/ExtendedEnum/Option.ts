import { BaseExtendedEnum, BaseExtendedEnumPartial } from "./main.js";

class Some<T> extends BaseExtendedEnumPartial<T> {
  static value = 1;
}

class None<T> extends BaseExtendedEnumPartial<T> {
  static value = 0;
}

export class Option extends BaseExtendedEnum {
  static Some = Some;

  static None = None;
}
export type TOption<T = unknown, E = unknown> = Some<T> | None<E>;
