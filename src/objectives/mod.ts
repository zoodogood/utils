export * from './CustomCollector.js';
export * from './GlitchText.js';
export * from './getRandomNumberInRange.js';
export * from './rangeToArray.js';


function omit(object: Object, filter: CallableFunction){
	const entries = Object.entries(object)
	  .filter(([key, value], i) => filter(key, value, i));

	return Object.fromEntries(entries);
}







export { omit };