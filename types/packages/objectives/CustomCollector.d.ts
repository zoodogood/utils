export type CustomCollectorOptions = {
    target: object;
    event: string;
    filter: Function;
    time?: number;
};
/**
 * @typedef CustomCollectorOptions
 * @property {object} target
 * @property {string} event
 * @property {Function} filter
 * @property {number} [time=0]
*/
export class CustomCollector {
    /**
     *
     * @param {CustomCollectorOptions} param0
    */
    constructor({ target, event, filter, time }: CustomCollectorOptions);
    target: any;
    event: string;
    filter: Function;
    time: number;
    /**
     *
     * @param {Function} callback
     * @returns {void}
     */
    setCallback(callback: Function): void;
    /**
     * @param {Function} handler
     * @returns {void}
    */
    handle(handler: Function): void;
    end(): void;
    removeTimeout(): void;
    /**
     * @param {number} ms
     * @returns {void}
    */
    setTimeout(ms: number): void;
    timeoutId: number;
    #private;
}
