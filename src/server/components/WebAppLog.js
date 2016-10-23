"use strict";

import path from "path";
import deepAssign from "deep-assign";
import log4js from "log4js";
import {BaseComponent} from 'lobenton';

function createAppenders(config) {
	let newAppenders = [];
	
	Object.keys(config.rules).map(function loopRule(levelName, index) {
		let levelSetting = config.rules[levelName];
		
		if(levelSetting.enabled === false){
			return;
		}
		
		levelSetting.type = "file",
		levelSetting.category = levelName;
		
		if(levelSetting.hasOwnProperty("filename")){
			if( !/\//.test(levelSetting.filename) ){
				if(config.hasOwnProperty("filepath")) {
					levelSetting.filename = path.join(config.filepath, levelSetting.filename);
				}else{
					levelSetting.filename = path.join(config.basePath+"/runtime", levelSetting.filename);
				}
			}
		}else{
			if(config.hasOwnProperty("filepath")){
				levelSetting.filename = path.join(config.filepath, levelName+".log");
			}else{
				levelSetting.filename = path.join(config.basePath+"/runtime", levelName+".log");
			}
		}
		
		newAppenders.push(levelSetting);
	});
	
	return newAppenders;
}

class WebAppLog extends BaseComponent {
	constructor() {
		super();
	}
	
	initial() {
		let config = {appenders: []};
		let newAppenders = [];
		
		if(this.config.hasOwnProperty("replaceConsole") && this.config.replaceConsole === true){
			config.replaceConsole = this.config.replaceConsole;
		}
		
		if(this.config.hasOwnProperty("showConsole") && this.config.showConsole === true){
			config.appenders.push({"type" : "console"});
		}
		
		if(this.config.hasOwnProperty("format")){
			config.format = this.config.format;
		}
		
		if(this.config.rules !== null) {
			newAppenders = createAppenders(this.config);
		}
		
		config.appenders = config.appenders.concat(newAppenders);

		log4js.configure(config);
	}
	
	getLogger(levelName){
		if(levelName){
			return this.config.rules.hasOwnProperty(levelName) && this.config.rules[levelName].enabled ? log4js.getLogger(levelName) : null;
		}else{
			return log4js;
		}
	}
	
	do(levelName, errorObject) {
		let logger = this.getLogger(levelName);
		
		if(logger){
			logger.error(errorObject);
		}
	}
}

export default WebAppLog;