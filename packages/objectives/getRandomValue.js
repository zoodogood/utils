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

 export { getRandomValue };