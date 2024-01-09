import { expect, test } from "vitest";
import { Result } from "../../src/objectives/ExtendedEnum/Result.js";
import { existsSymbol } from "../../src/objectives/equal.js";

test("new Result.Err", () => {
  const { Err, StatusImTeapot } = Result;
  const result = new Err<number>(StatusImTeapot);
  expect(result.toBoolean() === false);
  expect(result.is(Err) === true);
});

test("new Result.Ok", () => {
  const { Ok, Err, StatusSuccess } = Result;
  const result = new Ok<{ status: number; data: { x: number; y: number } }>({
    status: StatusSuccess,
    data: { x: 5, y: 2 },
  });
  expect(result.toBoolean()).true;
  expect(result.is(Err)).false;

  expect(result.some({ status: StatusSuccess, data: { x: 5, y: 2 } })).true;
  expect(result.some({ status: StatusSuccess, data: { x: 5, y: 2, z: 3 } }))
    .false;

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
});
