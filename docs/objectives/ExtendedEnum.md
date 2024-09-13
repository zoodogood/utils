# Extended enumerations
## Pattern
Expanded enumerations, in this case, are full of data while retaining their strengths: obviousness, manageability. This concept is taken from the Rust language, of which enumerations are an important part

## Syntax
In example: enum Result, using Result.Ok with `props`: custom data and static status message.
```ts
const { Ok, Err, StatusSuccess } = Result;
const result = new Ok<{ status: number; data: { x: number; y: number } }>({
	status: StatusSuccess,
	data: { x: 5, y: 2 },
});

// Because Ok is not Err: Ok.value === 1, Err.value === 0
expect(result.toBoolean()).true;
// same result instanceof Err
expect(result.is(Err)).false;

// deepEqual
expect(result.some({ status: StatusSuccess, data: { x: 5, y: 2 } })).true;
expect(result.some({ status: StatusSuccess, data: { x: 5, y: 2, z: 3 } }))
	.false;

// if props - object, check contains the specified properties
expect(
	result.includes({
        status: StatusSuccess,
        data: { x: existsSymbol, y: 2 },
	}),
).true;
expect(
	result.includes({
	    data: { x: existsSymbol },
	}),
).true;
expect(
	result.includes({
        status: StatusSuccess,
        data: { x: existsSymbol, y: 2, z: existsSymbol },
	}),
).false;
```
## Create you own Enum
```ts
import { BaseExtendedEnum, BaseExtendedEnumPartial } from "@zoodogood/utils/objectives/ExtendedEnum";

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

```
## Import
```ts
import { Result, Option, BooleanWithMessage } from "@zoodogood/utils/objectives";
```
```ts
import { existsSymbol } from "@zoodogood/utils/objectives";
```
=== Examples
```ts
const result = this.checkTimer();
if (result.some(StatusNotFound)){
	return "Таймер не запущен или его не существует";
}

if (result.some(StatusProcessing)){
	return "Таймер ещё продолжает работу";
}

if (result.some(StatusSuccess)){
	// Некоторая работа
	return "Таймер завершился, пора бы что-то сделать";
}
```
===