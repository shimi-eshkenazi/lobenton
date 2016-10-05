"use strict";

import RequestHandler from "./RequestHandler.js";
import ConponentCreator from "./ConponentCreator";
import {BaseComponent} from 'lobenton';
import ClientRouterCreator from './ClientRouterCreator.js';
import Utils from "../utils/Utils.js";

class AppCreator extends BaseComponent {
	constructor () {
		super();
		this.reactRouter = null;
		this.components = {};
		this.clientRouterCreator = null;
	}
	
	initial () {
		this.createComponents(true);
		
		if(process.env.NODE_ENV === "dev" && !this.config.isStart){
			// 有 webpack config 才做事 
			if(this.config.webpackDevConfig){
				this.clientRouterCreator = new ClientRouterCreator();
				this.clientRouterCreator.setUrlManager(this.components["UrlManager"]);
				this.clientRouterCreator.setConfig(this.config);
			}
			
			let HMR = require("./HMR.js");
			HMR = HMR.default || HMR;	
			HMR.change(function change(filePath) {
				this.components = {"Log":this.components["Log"]};
				this.createComponents(false);
				
				if(this.config.webpackDevConfig){
					this.clientRouterCreator.setUrlManager(this.components["UrlManager"]);
					this.clientRouterCreator.setConfig(this.config);
					this.clientRouterCreator.renew(filePath);
				}
			}.bind(this));

			if(this.config.webpackDevConfig){
				this.clientRouterCreator.after(function after() {
					this.reactRouter = require("lobenton/createRouter.js").default;
					new RequestHandler(this.config, this.reactRouter);
				}.bind(this));
				this.clientRouterCreator.initial();
			}else{
				new RequestHandler(this.config);
			}
		}else{
			if(this.config.webpackDevConfig){
				this.reactRouter = require("lobenton/createRouter.js").default;
			}
			
			new RequestHandler(this.config, this.reactRouter);
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
					componentSetting.urlPrefixPath = this.config.urlPrefixPath;
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
			}
			
			return this.handleRequest(request, response, data, errorObject);
		}else{
			response.statusCode = 500;
			response.setHeader('Content-Type', 'text/html');
			response.end("Forward error : forwardBridge");
		}
	}
	
	handleRequest(request, response, data, errorObject) {
		let handler = new RequestHandler(this.config, this.reactRouter);
		handler.setRequest(request);
		handler.setResponse(response);
		handler.exec(data, errorObject);
	}
}

export default AppCreator;