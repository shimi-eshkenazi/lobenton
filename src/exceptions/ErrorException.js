"use strict";

import ExtendableError from "./ExtendableError.js";

class ErrorException extends ExtendableError {
	constructor(message) {
		super(message);
		this.code = 500;
		this.name = "ErrorException";
	}
}

export default ErrorException;
