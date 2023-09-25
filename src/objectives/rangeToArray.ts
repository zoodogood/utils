export function rangeToArray([min, max]: [number, number]){
	if (isNaN(min) || isNaN(max)){
		return NaN;
	}
	return [...new Array(max - min + 1)].map((_, index) => index + min);
}