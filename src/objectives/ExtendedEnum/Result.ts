import { BaseExtendedEnum, BaseExtendedEnumPartial } from "./main.js";

class Ok<T> extends BaseExtendedEnumPartial<T> {
  static value = 1;
}

class Err<T> extends BaseExtendedEnumPartial<T> {
  static value = 0;
}

export class Result extends BaseExtendedEnum {
  static Ok = Ok;

  static Err = Err;

  static StatusProcessing = 102;
  static StatusSuccess = 200;
  static StatusNotFound = 404;
  static StatusImTeapot = 418;
  static StatusInternalError = 500;
}
export type TResult<T = unknown, E = unknown> = Ok<T> | Err<E>;
