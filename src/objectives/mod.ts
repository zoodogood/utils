export * from "./CustomCollector.js";
export * from "./GlitchText.js";
export * from "./getRandomNumberInRange.js";
export * from "./rangeToArray.js";
export * from "./getRandomElementFromArray.js";
export * from "./DotNotatedInterface.js";
export * from "./ExtendedEnum/mod.js";

function omit(object: object, filter: CallableFunction) {
  const entries = Object.entries(object).filter(([key, value], i) =>
    filter(key, value, i),
  );

  return Object.fromEntries(entries);
}

export { omit };
