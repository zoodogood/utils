const existsSymbol = Symbol("isExist");

function deepEqual(target: unknown, compare: unknown): boolean {
  if (target === compare){
    return true;
  }

  if (typeof target !== typeof compare){
    return false;
  }

  if (Object.keys(target as object).length !== Object.keys(compare as object).length){
    return false;
  }

  return Object.entries(target as object)
    .every(([key, value]) => 
           deepEqual(value, (compare as {[key: string]: unknown})[key])
          );
}

function checkProperiesExistsOrEqual(match: object, target: {[key: string]: unknown}){
  return Object.entries(match).every(([key, value]: [string, unknown]) => {
    if (value === existsSymbol){
      return key in target;
    }

    return deepEqual(value, target[key]);
  });
}

class BaseExtendedEnumPartial<T> {
  static from(data: object) {
    return Object.assign(Object.create(this.prototype), data);
  }

  get props(): T {
    return this.props;
  }

  includes(props: T) {
    return props !== null && typeof props === "object" 
      ? checkProperiesExistsOrEqual(props, this.props as {[key: string]: unknown}) 
      : this.props === props;
  }

  some(props: T) {
    return deepEqual(this.props, props);
  }

  is(constructor: typeof BaseExtendedEnumPartial){
   return this instanceof constructor;
  }
}

class BaseExtendedEnum {
  static is(instance: TRwsult, constructor: typeof BaseExtendedEnumPartial){
    return instance instanceof constructor;
  }
}

class Ok<T> extends BaseExtendedEnumPartial<T> {
  toBoolean() {
    return true;
  }
}

class Err<T> extends BaseExtendedEnumPartial<T> {
  toBoolean() {
    return false;
  }
}
class Result extends BaseExtendedEnum {
  static Ok = Ok;

  static Err = Err;

  static StatusNotExists = 1;
  static StatusReady = 2;
  static StatusInProcess = 3;
}
type TRwsult<T = unknown, E = unknown> = Ok<T> | Err<E>

export { Result };
