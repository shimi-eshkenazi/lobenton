"use strict";

import path from "path";
import {BaseComponent} from 'lobenton';
import Utils from "../utils/Utils.js";
import RequireByFormat from "../utils/RequireByFormat.js";

class ConponentCreator extends BaseComponent {
	constructor(name) {
		super();
		this.name = Utils.capitalizeFirstLetter(name);
	}
	
	initial() {
		try{
			let componentSource = '';
			let component = null;
			
			if(this.config.hasOwnProperty('class')){
				if(/\./.test(this.config["class"])){
					component = RequireByFormat(this.config["class"]);
				}else{
					componentSource = path.resolve(this.config["class"]);
					component = require(componentSource);
				}
			}else{
				componentSource = "./components/WebApp" + this.name;
				component = require(componentSource);
			}
			
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