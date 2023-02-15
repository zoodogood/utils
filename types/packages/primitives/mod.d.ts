export type EndingOptions = {
    unite?: (argv1: number, argv2: string) => string;
};
/**
 * @typedef EndingOptions
 * @property {(argv1: number, argv2: string) => string} [unite]
*/
/**
 * @param {number} quantity
 * @param {string} base
 * @param {string} multiple
 * @param {string} alone
 * @param {string} double
 * @param {EndingOptions} options
 * @returns {string|NaN}
 */
export function ending(quantity: number, base: string, multiple: string, alone: string, double: string, options?: EndingOptions): string | number;
