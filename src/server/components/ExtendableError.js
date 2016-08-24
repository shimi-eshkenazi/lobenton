"use strict";

import Utils from "../../utils/Utils.js";

class ExtendableError extends Error {
	constructor(message) {
		let errorObject = null;
		let stack = null;
		
		if(typeof message === 'object'){
			errorObject = message;
			message = errorObject.message;
			stack = errorObject.stack;
		}else{
			let thisError = new Error(message);
			stack = thisError.stack;
		}
		
		super(message);
		this.message = message; 
		this.stack = stack;
		
		if(/\[\d+\w/.test(this.stack)){
			this.stack = this.stack.replace(/\[\d+\w/g,"");
			this.stack = this.stack.replace(/\satform/g," at form");
		}
		
		this.stack = this.stack.replace("<","&lt;").replace(">","&gt;")
	}
}

export default ExtendableError;