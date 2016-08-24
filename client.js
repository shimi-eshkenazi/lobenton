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

exports.WrapComponent = require("./src/client/components/WrapComponent.js").default;
exports.languageActions = require("./src/client/actions/language.js");
exports.reducers = require("./src/client/reducers/index.js").default;
exports.ConfigureStore = require("./src/client/store/ConfigureStore.js").default;