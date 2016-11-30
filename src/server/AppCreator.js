"use strict";

import path from "path";
import RequestHandler from "./RequestHandler.js";
import ConponentCreator from "./ConponentCreator";
import {BaseComponent} from 'lobenton';
import ClientRouterCreator from './ClientRouterCreator.js';
import Utils from "../utils/Utils.js";

class AppCreator extends BaseComponent {
	constructor () {
		super();
		this.simple = false;
		this.reactRouter = null;
		this.components = {};
		this.clientRouterCreator = null;
	}
	
	initial () {
		this.createComponents(true);
		
		let createRouterFilepath = path.resolve(__dirname, "../../createRouter.js");
		
		if(this.config.hasOwnProperty("routerFolder") && this.config.routerFolder !== ""){
			 createRouterFilepath = path.join(this.config.basePath, this.config.routerFolder, "createRouter.js");
		}
		
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
				if(/createRouter\.js/.test(filePath)){
					return;
				}
				
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
					new RequestHandler(this.config);
					
					setTimeout(function(){
						this.reactRouter = require(createRouterFilepath).default;
						
						const afterAppRunList = Utils.keep("afterAppRun");
						afterAppRunList.map((afterAppRun)=>{
							afterAppRun();
						});
					}.bind(this), 0);
				}.bind(this));
				this.clientRouterCreator.initial();
			}else{
				new RequestHandler(this.config);
			}
		}else{
			new RequestHandler(this.config);
			
			setTimeout(function(){
				if(this.config.webpackDevConfig){
					this.reactRouter = require(createRouterFilepath).default;
				}
			}.bind(this), 0);
		}
	}
	
	initialSimple(router) {
		this.simple = true;
		this.createComponents(false);
		
		if(router !== false){
			this.clientRouterCreator = new ClientRouterCreator();
			this.clientRouterCreator.setUrlManager(this.components["UrlManager"]);
			this.clientRouterCreator.setConfig(this.config);
			this.clientRouterCreator.initial();
		}
		
		new RequestHandler(this.config, this.reactRouter);
		
		const afterAppRunList = Utils.keep("afterAppRun");
		afterAppRunList.map((afterAppRun)=>{
			afterAppRun();
		});
	}
	
	createComponents(log) {
		if(this.config.components){
			for (let componentName in this.config.components){
				if(componentName !== 'log' || (componentName === 'log' && log === true)){
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
		handler.setSimple(this.simple);
		handler.setRequest(request);
		handler.setResponse(response);
		handler.exec(data, errorObject);
	}
}

export default AppCreator;