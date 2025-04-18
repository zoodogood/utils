import { randomNumberInRange } from "./randomNumberInRange.js";

interface IGlitchTextOptions {
	step?: number;
	random?: boolean;
	maximum?: number;
}


class GlitchText {
	declare from: string;
	declare to: string;
	declare step: number;
	declare random: boolean;
	declare maximum: number;
	declare [Symbol.iterator]: () => Generator<string>

	constructor(from = "", to = "hello, world", {step = 15, random = false, maximum = 100}: IGlitchTextOptions = {}){
		this.from = from;
		this.to   = to;
	
		this.step    = step;
		this.random  = random;
		this.maximum = maximum;
	
		this[Symbol.iterator] = this.iteratorFunction;
	}
 
	
	*iteratorFunction(){
		const word = [...this.from];
		const target = this.to;
		const MIN = 20;
		const MAX = 40;
	
		while (word.length !== target.length){
			if (word.length > target.length)
				word.pop();
	
			if (word.length < target.length)
				word.push( String.fromCharCode(~~(Math.random() * 50)) );
	
			word.forEach((_, index, array) =>
				array[index] = String.fromCharCode( randomNumberInRange({min: MIN, max: MAX}) ));

			yield word.join("");
		}
	
 
		if (this.maximum)
		for (const index in word){
			const charCode   = word[ index ].charCodeAt(0);
			const targetCode = target[ index ].charCodeAt(0);
	
			if (Math.abs(charCode - targetCode) > this.maximum)
				word[ index ] = String.fromCharCode(
					charCode > targetCode ?
					targetCode + this.maximum :
					targetCode - this.maximum
				);
	
		};
	
	
	
		while ( word.join("") !== target ){
	
			word.forEach((letter, i) => {
				if (letter === target[i])
					return;
	
	
				const
					charCode   = letter.charCodeAt(0),
					targetCode = target[i].charCodeAt(0);
	
				const isUpper = targetCode > charCode;
	
				let step = Math.min(
					Math.abs(targetCode - charCode),
					this.step
				);
	
				if (this.random)
					step *= Math.random() * 2;
	
				word[i] = String.fromCharCode(  isUpper ? charCode + step : charCode - step  );
			});
	
			yield word.join("");
		}
	
	
		return;
	}
}


export { GlitchText };
