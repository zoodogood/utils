import { DotNotatedInterface } from "../src/objectives/DotNotatedInterface";
import { expect, test } from "vitest";

const target = {
  parent: {
    nested: [true],
  },
  beRemoved: 0
};


test("Get array value; Set not exists value by callback", () => {
  const _interface = new DotNotatedInterface(target);

  expect(_interface.getItem("parent.nested.0")).toBe(true);

  
  expect(
	// @ts-ignore
    _interface.setItem("parent.numbers.y", (value: number | null) => value + 5)
  ).toBe(5);
});


test("Get not exists; Check exists; Remove item", () => {
	const _interface = new DotNotatedInterface(target);
 
	expect(_interface.getItem("notexists")).toBe(null);

	expect(_interface.hasItem("beRemoved")).toBe(true);
	expect(_interface.removeItem("beRemoved")).toBe(true);
	expect(_interface.hasItem("beRemoved")).toBe(false);

	expect(_interface.hasItem("exists")).toBe(false);
 });