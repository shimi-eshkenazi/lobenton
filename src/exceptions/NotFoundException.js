"use strict";

import ExtendableError from "./ExtendableError.js";

class NotFoundException extends ExtendableError {
	constructor(message) {
		super(message);
		this.code = 404;
		this.name = "NotFoundException";
	}
}

export default NotFoundException;
