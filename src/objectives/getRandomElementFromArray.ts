import { getRandomNumberInRange } from "./getRandomNumberInRange.js";

interface IParams {
  needPop?: boolean;
  associatedWeights?: number[];
}

export function getRandomElementIndexInWeights(
  weights: NonNullable<IParams["associatedWeights"]>,
): number | never {
  if (weights.length < 1) {
    new Error("Invalid array length");
  }

  let previousLimit = 0;
  const thresholds = weights.map(
    (weight) => (previousLimit += weight),
  ) as number[];

  const lotterySecretNumber = Math.random() * thresholds.at(-1)!;
  return thresholds.findIndex((threshold) => threshold >= lotterySecretNumber);
}

export function getRandomElementFromArray<T>(
  array: T[],
  { needPop, associatedWeights }: IParams = {},
) {
  if (associatedWeights && associatedWeights.length !== array.length) {
    throw new Error(
      "Incorrectly passed argument associatedWeights: The length of the associatedWeights must exactly match the length of the weights array",
    );
  }
  const index = associatedWeights
    ? getRandomElementIndexInWeights(associatedWeights)
    : getRandomNumberInRange({ max: array.length - 1 });

  const input = array[index];
  if (needPop) {
    array.splice(index, 1);
    associatedWeights?.splice(index, 1);
  }
  return input;
}
