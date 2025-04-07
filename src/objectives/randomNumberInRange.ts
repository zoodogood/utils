interface IGetRandomValueOptions {
	min?: number;
	max: number;
	needRound?: boolean;
}

function randomNumberInRange({
	min = 0,
	max,
	needRound = true,
}: IGetRandomValueOptions) {
	let value = Math.random() * (max - min + Number(needRound)) + min;

	if (needRound) {
		value = Math.floor(value);
	}
	return value;
}

export { randomNumberInRange };
