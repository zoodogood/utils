export type GlitchTextOptions = {
    step?: number;
    random?: boolean;
    maximum?: number;
};
/**
 * @typedef {Object} GlitchTextOptions
 * @property {number} [step=15]
 * @property {boolean} [random=false]
 * @property {number} [maximum=100]
*/
export class GlitchText {
    /**
     *
     * @param {string} from
     * @param {string} to
     * @param {GlitchTextOptions} param2
     */
    constructor(from?: string, to?: string, { step, random, maximum }?: GlitchTextOptions);
    from: string;
    to: string;
    step: number;
    random: boolean;
    maximum: number;
    /**
     * @generator
     * @yields {string}
     */
    iteratorFunction(): {};
}
