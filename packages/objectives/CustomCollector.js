/**
 * @typedef CustomCollectorOptions
 * @property {object} target
 * @property {string} event
 * @property {Function} filter
 * @property {number} [time=0]
*/

class CustomCollector {

	/** @type {Function} */
	#callback;
	
	/**
	 * 
	 * @param {CustomCollectorOptions} param0 
	*/
	constructor({target, event, filter, time = 0}){
	  if ("on" in target === false){
		 throw new Error("Target must be similar to EventEmitter.prototype — target haven't method 'on'");
	  }
 
	  this.target = target;
	  this.event = event;
	  this.filter = filter;
	  this.time = time;
	}
	
	/**
	 * 
	 * @param {Function} callback 
	 * @returns {void}
	 */
	setCallback(callback){
		
	  const handler = (...params) => {
		 const passed = !this.filter || this.filter(params);
 
		 if (!!passed === true){
			callback.apply(this, params);
		 };
	  }
	  
	  this.handle(handler);
	}
 
	/**
	 * @param {Function} handler 
	 * @returns {void}
	*/
	handle(handler){
	  this.end();
	  
	  this.#callback = handler;
	  this.target.on(this.event, this.#callback);
 
	  if (this.time > 0){
		 this.setTimeout(this.time);
	  };
	}
 
	end(){
	  	if (this.timeoutId){
			this.removeTimeout();
		}
	  	
		if (this.#callback){
			this.target.removeListener(this.event, this.#callback);
		}
	}
 
	removeTimeout(){
	  clearTimeout(this.timeoutId);
	}
	
	/**
	 * @param {number} ms 
	 * @returns {void}
	*/
	setTimeout(ms){
	  const callback = this.end.bind(this);
	  this.timeoutId = setTimeout(callback, ms);
	}
 }

 export { CustomCollector };