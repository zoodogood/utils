import { BaseExtendedEnum, BaseExtendedEnumPartial } from "./main.js";

class True<T> extends BaseExtendedEnumPartial<T> {
  static value = 1;
}

class False<T> extends BaseExtendedEnumPartial<T> {
  static value = 0;
}

export class BooleanWithMessage extends BaseExtendedEnum {
  static True = True;

  static False = False;
}
export type TBooleanWithMessage<T = unknown, E = unknown> = True<T> | False<E>;
