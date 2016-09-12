"use strict";

import RequestHandler from "./RequestHandler.js";
import ConponentCreator from "./ConponentCreator";
import {BaseComponent} from 'lobenton';
import ClientRouterCreator from './ClientRouterCreator.js';
import Utils from "../utils/Utils.js";

class AppCreator extends BaseComponent {
	constructor () {
		super();
		this.components = {};
		this.clientRouterCreator = null;
	}
	
	initial () {
		this.createComponents(true);
		
		if(process.env.NODE_ENV === "dev" && !this.config.isStart){
			this.clientRouterCreator = new ClientRouterCreator();
			this.clientRouterCreator.setUrlManager(this.components["UrlManager"]);
			this.clientRouterCreator.setConfig(this.config);
			
			let HMR = require("./HMR.js");
			HMR = HMR.default || HMR;	
			HMR.change(function change(filePath) {
				this.components = {};
				this.createComponents(false);
				this.clientRouterCreator.setUrlManager(this.components["UrlManager"]);
				this.clientRouterCreator.setConfig(this.config);
				this.clientRouterCreator.renew(filePath);
			}.bind(this));

			this.clientRouterCreator.after(function after() {
				require("lobenton/createRouter");
				new RequestHandler(this.config);	
			}.bind(this));
			this.clientRouterCreator.initial();
		}else{
			require("lobenton/createRouter");
			new RequestHandler(this.config);
		}
	}
	
	initialSimple() {
		this.createComponents(true);
		this.clientRouterCreator = new ClientRouterCreator();
		this.clientRouterCreator.setUrlManager(this.components["UrlManager"]);
		this.clientRouterCreator.setConfig(this.config);
		this.clientRouterCreator.initial();
	}
	
	createComponents(noLog) {
		if(this.config.components){
			for (let componentName in this.config.components){
				if(componentName !== 'log' || (componentName === 'log' && noLog === true)){
					const componentSetting = this.config.components[componentName];
					componentSetting.basePath = this.config.basePath;
					this.components[Utils.capitalizeFirstLetter(componentName)] = this.createComponent(componentName, componentSetting);
				}
			}
		}
	}
	
	createComponent(componentName, componentSetting) {
		let conponentCreator = new ConponentCreator(componentName);
		conponentCreator.setConfig(componentSetting);
		return conponentCreator.initial();
	}
	
	getComponent(componentName) {
		componentName = Utils.capitalizeFirstLetter(componentName);
		
		if(this.components.hasOwnProperty(componentName) && this.components[componentName] !== null){
			return this.components[componentName];
		}
		
		throw new Error("Component " + componentName + " is not defined in your config.components");
	}
	
	getConfig() {
		return this.config; 
	}
	
	forwardBridge(path, data, request, response, errorObject) {
		const oldPathname = Utils.fixUrl(request).pathname;
		
		if(/.+\..+$/.test(oldPathname)){
			response.statusCode = 404;
			response.setHeader('Content-Type', 'text/html');
			response.end("");
			return;
		}
		
		if(path !== "") {
			if(request.url  !== path) {
				request.url = path;
				request._parsedUrl.pathname = path;
				request._parsedUrl.path = path;
				request._parsedUrl.href = path;
				request._parsedUrl._raw = path;
				return this.handleRequest(request, response, data, errorObject);
			}else{
				if(!errorObject){
					errorObject = new Error("Server Error");
				}
			}
		}
		
		response.statusCode = errorObject.code;
		response.setHeader('Content-Type', 'text/html');
		response.end("<pre>"+errorObject.stack+"</pre>");
	}
	
	handleRequest(request, response, data, errorObject) {
		let handler = new RequestHandler(this.config);
		handler.setRequest(request);
		handler.setResponse(response);
		handler.exec(data, errorObject);
	}
}

export default AppCreator;