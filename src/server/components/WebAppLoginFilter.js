"use strict";

import {BaseComponent} from 'lobenton';

class WebAppLoginFilter extends BaseComponent {
	constructor() {
		super();
		this.service = null;
	}
	
	initial() {
		this.service = "no instance";
	}
	
	do(controllerInstance) {
		controllerInstance.continue(true);
	}
}

export default WebAppLoginFilter;