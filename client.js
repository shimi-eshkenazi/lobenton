"use strict";

var sourceConsoleError = console.error;
console.error = function(){
	if(typeof arguments[0] === 'string'){
		if(/Unexpected keys|React attempted to reuse markup in a container/g.test(arguments[0])){
			return;
		}
		
		return sourceConsoleError.apply(this, arguments);
	}
}

exports.WrapComponent = require("./lib/client/components/WrapComponent.js").default;
exports.languageActions = require("./lib/client/actions/language.js");
exports.reducers = require("./lib/client/reducers/index.js").default;
exports.ConfigureStore = require("./lib/client/store/ConfigureStore.js").default;