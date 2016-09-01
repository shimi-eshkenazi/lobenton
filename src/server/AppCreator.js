"use strict";

import RequestHandler from "./RequestHandler.js";
import ConponentCreator from "./ConponentCreator";
import {BaseComponent} from 'lobenton';
import Utils from "../utils/Utils.js";

class AppCreator extends BaseComponent {
	constructor () {
		super();
		this.components = {};
		this.clientRouterCreator = null;
	}
	
	initial () {
		let ClientRouterCreator = require('./ClientRouterCreator.js');
		ClientRouterCreator = ClientRouterCreator.default || ClientRouterCreator;
		
		this.createComponents();
		
		const argv2 = process.argv[2] || null;
		if(this.config.env === "dev"){
			this.clientRouterCreator = new ClientRouterCreator();
			this.clientRouterCreator.setUrlManager(this.components["UrlManager"]);
			this.clientRouterCreator.setConfig(this.config);
			
			if(argv2 === "--dev"){
				let HMR = require("./HMR.js");
				HMR = HMR.default || HMR;	
				HMR.change(function change(filePath) {
					this.components = {};
					this.createComponents();
					this.clientRouterCreator.setUrlManager(this.components["UrlManager"]);
					this.clientRouterCreator.setConfig(this.config);
					this.clientRouterCreator.renew(filePath);
				}.bind(this));
			}
			
			this.clientRouterCreator.after(function after() {
				new RequestHandler(this.config);	
			}.bind(this));
			this.clientRouterCreator.initial(true);
		}else{
			new RequestHandler(this.config);
		}
	}
	
	createComponents() {
		if(this.config.components){
			for (let componentName in this.config.components){
				const componentSetting = this.config.components[componentName];
				componentSetting.basePath = this.config.basePath;
				this.components[Utils.capitalizeFirstLetter(componentName)] = this.createComponent(componentName, componentSetting);
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