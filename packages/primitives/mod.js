function ending(quantity = 0, base, multiple, alone, double, options = {}) {
	if ( isNaN(quantity) )
	  return NaN;
 
 
	const numbers = quantity % 100 > 20 ?
	  quantity % 20 :
	  quantity % 10;
 
	const end = (numbers >= 5 || numbers === 0) ?
	  multiple :
	  (numbers > 1) ? double : alone;
 
	const word = base + end;
 
	options.unite ||= (quantity, word) => `${ quantity } ${ word }`;
 
	const input = options.unite(quantity, word);
	return input;
 };
 
 
 export {
	ending
 }
 