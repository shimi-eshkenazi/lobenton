"use strict";

import is from "is";
import parseUrl from "parseurl";
import qs from "qs";

class Utils {
	static fixUrl(request) {
		return parseUrl(request)
	}
	
	static fixQuery() {
		return function query(request, response, next){
			if (!request.query) {
				var parseResult = Utils.fixUrl(request).query;
				request.query = qs.parse(parseResult, {});
			}

			next();
		};
	}
	
	static capitalizeFirstLetter(string) {
		if(!string){
			return string;
		}
		
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
	
	static lowerFirstLetter(string) {
		if(!string){
			return string;
		}
		
		return string.charAt(0).toLowerCase() + string.slice(1);
	}
	
	static getPosition(string, keyword, index) {
		return string.split(keyword, index).join(keyword).length;
	}
	
	static getAllMethods(target) {
		return Object.getOwnPropertyNames(target).filter(key => is.fn(target[key]))
	}
}

export default Utils;