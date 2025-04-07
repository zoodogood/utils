export * from "./BusyNumeric.js";
export * from "./CustomCollector.js";
export * from "./DotNotatedInterface.js";
export * from "./ExtendedEnum/mod.js";
export * from "./GlitchText.js";
export * from "./LazySort/LazySort.build.js";
export * from "./randomElementFromArray.js";
export * from "./randomNumberInRange.js";
export * from "./rangeToArray.js";

function omit(object: object, filter: CallableFunction) {
  const entries = Object.entries(object).filter(([key, value], i) =>
    filter(key, value, i),
  );

  return Object.fromEntries(entries);
}

export { omit };
