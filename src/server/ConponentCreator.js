"use strict";

import path from "path";
import {BaseComponent} from 'lobenton';
import Utils from "../utils/Utils.js";

class ConponentCreator extends BaseComponent {
	constructor(name) {
		super();
		this.name = Utils.capitalizeFirstLetter(name);
	}
	
	initial() {
		try{
			let componentSource = this.config.hasOwnProperty('class') ? path.resolve(this.config["class"]) : "./components/WebApp" + this.name;	
			let component = require(componentSource);
			component = component.default || component;

			let componentInstance = new component();
			componentInstance.setConfig(this.config);
			const result = componentInstance.initial();
			
			if(result === "no impl!"){
				throw new Error("No impl 'initial' for system call in " + this.name);
			}
			
			return componentInstance;
		}catch(componentLoadError){
			console.log(componentLoadError);
			return null;
		}
	}
}

export default ConponentCreator;