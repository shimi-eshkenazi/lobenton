"use strict";

import path from "path";
import HMR from "./server/HMR.js";
import BaseController from "./server/components/BaseController.js";
import BaseComponent from "./server/components/BaseComponent.js";
import ExtendableError from "./exceptions/ExtendableError.js";
import DeviceDetector from "./utils/DeviceDetector.js";
import I18nDetector from "./utils/I18nDetector.js";
import Utils from "./utils/Utils.js";
import CookieUtil from "./utils/CookieUtil.js";
import TimerUtil from "./utils/TimerUtil.js";

let isStart = JSON.parse(process.env.npm_config_argv).original.slice(-1).pop() === "start";

function setConfig(){
	let config = require(this.configPath);
	config = config.default || config;
	config.isStart = isStart;

	process.title = config.name;
	
	if(process.env.NODE_ENV === "dev" && !isStart){
		HMR(config.basePath, () => {
			config = require(this.configPath);
			config = config.default || config;
			config.isStart = isStart;
			this.creator.setConfig(config);
		});
	}
	
	this.creator.setConfig(config);
}

class Lobenton {
	constructor() {
		this.configPath = "";
		this.creator = null;
	}
	
	static createApplication(configPath) {
		TimerUtil.start("Load lobenton");
		
		this.configPath = configPath;
		
		require('css-modules-require-hook')({
			generateScopedName: '[name]__[local]___[hash:base64:5]',
		});
		
		let ServerCreator = require("./server/ServerCreator.js");
		ServerCreator = ServerCreator.default || ServerCreator;
		this.creator= new ServerCreator();
		
		return Lobenton;
	}
	
	static run(){
		const beforeServerRunList = Utils.keep("beforeServerRun");
		beforeServerRunList.map((beforeServerRun)=>{
			beforeServerRun();
		});
		
		setConfig.call(this);
		return this.creator.initial();
	}
	
	static runSimple(){
		const beforeServerRunList = Utils.keep("beforeServerRun");
		beforeServerRunList.map((beforeServerRun)=>{
			beforeServerRun();
		});
		
		setConfig.call(this);
		return this.creator.initialSimple(false);
	}
	
	static createRouter(){
		const beforeServerRunList = Utils.keep("beforeServerRun");
		beforeServerRunList.map((beforeServerRun)=>{
			beforeServerRun();
		});
		
		setConfig.call(this);
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
	
	static renewComponents(){
		return this.creator.getApp().createComponents(false);
	}
	
	static beforeServerRun(callback) {
		Utils.keep("beforeServerRun", callback);
	}
	
	static afterServerRun(callback) {
		Utils.keep("afterServerRun", callback);
	}
	
	static beforeAppRun(callback) {
		Utils.keep("beforeAppRun", callback);
	}
	
	static afterAppRun(callback) {
		Utils.keep("afterAppRun", callback);
	}
	
	static beforeWebpackRun(callback) {
		Utils.keep("beforeWebpackRun", callback);
	}
	
	static afterWebpackRun(callback) {
		Utils.keep("afterWebpackRun", callback);
	}
}

export {BaseController, BaseComponent, ExtendableError, DeviceDetector, I18nDetector, Utils, CookieUtil, TimerUtil, HMR};
export default Lobenton;