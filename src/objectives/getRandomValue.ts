interface IGetRandomValueOptions {
	min?: number;
	max: number;
	round?: boolean;
}


function getRandomValue({min = 0, max, round = true}: IGetRandomValueOptions){
	let value = Math.random() * (max - min + Number(round)) + min;
 
	if (round){
		value = Math.floor(value);
	}
	return value;
 }

 export { getRandomValue };