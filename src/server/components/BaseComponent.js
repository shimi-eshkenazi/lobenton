"use strict";

class BaseComponent {
	constructor() {
		this.config = {};
	}
	
	setConfig(config) {
		this.config = config;
	}
	
	getConfig() {
		return this.config;
	}
	
	initial() {
		return "no impl!";
	}
	
	do() {
		return "no impl!";
	}
}

export default BaseComponent;