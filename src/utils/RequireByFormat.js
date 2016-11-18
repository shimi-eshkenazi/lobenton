"use strict";

export default function RequireByFormat(expression) {
	const expressionArray = expression.split(".");
	let target = {};
	
	try {
		if(expressionArray.length > 0){
			target = require(expressionArray[0]);
			
			if(expressionArray.length > 1){
				target = target.default || target;
				
				for(var index = 0; index < expressionArray.length; index++){
					if(index !== 0){
						target = target[expressionArray[index]];
					}
				}
			}
			
			return target;
		}else{
			throw new Error("Expression error at RequireByFormat");
		}
	}catch(e){
		throw e;
	}
};