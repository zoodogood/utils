export * from './CustomCollector.js';

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
function getRandomValue({min = 0, max, round = true}){
	let value = Math.random() * (max - min + Number(round)) + min;
 
	if (round){
		value = Math.floor(value);
	}
	return value;
 }

export { omit, getRandomValue };