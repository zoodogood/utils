export * from './CustomCollector.js';
export * from './GlitchText.js';
export * from './getRandomValue.js';

/**
 * @param {object} object
 * @param {(argv0: string, argv1: unknown, argv2: number) => void} filter
 * @returns {object}
*/
function omit(object, filter){
	const entries = Object.entries(object)
	  .filter(([key, value], i) => filter(key, value, i));

	return Object.fromEntries(entries);
}






export { omit };