"use strict";

import path from "path";
import HMR from "./server/HMR.js";
import BaseController from "./server/components/BaseController.js";
import BaseComponent from "./server/components/BaseComponent.js";
import ExtendableError from "./server/components/ExtendableError.js";
import DeviceDetector from "./utils/DeviceDetector.js";
import I18nDetector from "./utils/I18nDetector.js";
import Utils from "./utils/Utils.js";
import CookieUtil from "./utils/CookieUtil.js";

class Lobenton {
	constructor() {
		this.configPath = "";
		this.creator = null;
	}
	
	static createApplication(configPath) {
		if(process.env.NODE_ENV !== 'dev'){
			configPath = configPath.replace(/^src/, "lib");
		}
		
		this.configPath = configPath;
		
		require('css-modules-require-hook')({
			generateScopedName: '[name]__[local]___[hash:base64:5]',
		});
		
		let ServerCreator = require("./server/ServerCreator.js");
		ServerCreator = ServerCreator.default || ServerCreator;
		
		let config = require(configPath);
		config = config.default || config;
		
		process.title = config.name;

		this.creator= new ServerCreator();
		this.creator.setConfig(config);
		
		const argv2 = process.argv[2] || null;
		if(config.env === "dev" && argv2 === "--dev"){
			HMR(config.basePath, function change() {
				config = require(configPath);
				config = config.default || config;
				this.creator.setConfig(config);
			}.bind(this));
		}
		
		return Lobenton;
	}
	
	static run(){
		return this.creator.initial();
	}
	
	static runSimple(){
		return this.creator.initialSimple();
	}
	
	static getConfig(){
		return this.creator.getConfig();
	}
	
	static getServer(){
		return this.creator.getServer();
	}
	
	static getApp(){
		return this.creator.getApp();
	}
	
	static setComponent(componentName, componentSetting){
		return this.creator.getApp().createComponent(componentName, componentSetting);
	}
	
	static getComponent(componentName){
		return this.creator.getApp().getComponent(componentName);
	}
}

export {BaseController, BaseComponent, ExtendableError, DeviceDetector, I18nDetector, Utils, CookieUtil};
export default Lobenton;