"use strict";

var sourceConsoleError = console.error;
console.error = function () {
	if (typeof arguments[0] === 'string') {
		if (/Unexpected key(|s)|React attempted to reuse markup in a container/g.test(arguments[0])) {
			return;
		}

		return sourceConsoleError.apply(this, arguments);
	}
};