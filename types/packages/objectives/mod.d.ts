export * from "./CustomCollector.js";
export * from "./GlitchText.js";
export type GetRandomValueOptions = {
    min?: number;
    max: number;
    round?: boolean;
};
/**
 * @param {object} object
 * @param {(argv0: string, argv1: unknown, argv2: number) => void} filter
 * @returns {object}
*/
export function omit(object: object, filter: (argv0: string, argv1: unknown, argv2: number) => void): object;
/**
 * @typedef GetRandomValueOptions
 * @property {number} [min = 0]
 * @property {number} max
 * @property {boolean} [round=true]
*/
/**
 *
 * @param {GetRandomValueOptions} param0
 * @returns {number}
*/
export function getRandomValue({ min, max, round }: GetRandomValueOptions): number;
