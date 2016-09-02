"use strict";

import path from "path";
import async from "async";
import serverStatic from "serve-static";
import deepAssign from "deep-assign";
import compression from "compression";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import getParameterNames from "get-parameter-names";
import Lobenton from "lobenton";
import ErrorException from "../exceptions/ErrorException.js";
import NotFoundException from "../exceptions/NotFoundException.js";
import Utils from "../utils/Utils.js";
import FileUtil from "../utils/FileUtil.js";
import RequireByFormat from "../utils/RequireByFormat.js";

let compiler = null;
let devMiddleware = null;
let hotMiddleware = null;
let Webpack = null;
let WebpackDevMiddleware = null;
let WebpackHotMiddleware = null;

function createCompiler(webpackDevConfig){
	if(!Webpack){
		Webpack = require("webpack");
		Webpack = Webpack.default || Webpack;
	}
	
	compiler = Webpack(webpackDevConfig);
}

function createDevMiddleware(webpackDevConfig){
	if(!WebpackDevMiddleware){
		WebpackDevMiddleware = require("webpack-dev-middleware");
		WebpackDevMiddleware = WebpackDevMiddleware.default || WebpackDevMiddleware;
	}
	
	devMiddleware = WebpackDevMiddleware(compiler, {
		noInfo: true, 
		publicPath: webpackDevConfig.output.publicPath,
		stats: {
			colors: true 
		}
	});
}

function createHotMiddleware(webpackDevConfig){
	if(!WebpackHotMiddleware){
		WebpackHotMiddleware = require("webpack-hot-middleware");
		WebpackHotMiddleware = WebpackHotMiddleware.default || WebpackHotMiddleware;
	}
	
	hotMiddleware = WebpackHotMiddleware(compiler);
}

class RequestHandler {
	constructor(config) {
		this.config = config;
		this.request = null;
		this.response = null;
		this.processChain = [
			compression(),
			serverStatic(path.join(this.config.basePath, "public")),
			Utils.fixQuery(),
			cookieParser(),
			bodyParser.json(),
			bodyParser.urlencoded({extended: true})
		];
		
		const argv2 = process.argv[2] || null;
		if(this.config.env === "dev" && argv2 === "--dev"){		
			let webpackDevConfigMain = require(this.config.webpackDevConfig);
			webpackDevConfigMain = webpackDevConfigMain.default || webpackDevConfigMain;
			
			const webpackDevConfig = webpackDevConfigMain(this.config);
			
			if(this.config.hasOwnProperty("webpackDevConfig")){
				if(!compiler){
					createCompiler(webpackDevConfig);
				}
				
				if(!devMiddleware){
					createDevMiddleware(webpackDevConfig);
				}
				
				if(!hotMiddleware){
					createHotMiddleware(webpackDevConfig);
				}
				
				this.processChain.push(devMiddleware, hotMiddleware);
			}
		}
		
		this.addMiddleWare();
	}
	
	addMiddleWare() {
		if(this.config.hasOwnProperty("middlewares")){
			Object.keys(this.config.middlewares).map(function loopMD(middlewareName) {
				const mdSetting = this.config.middlewares[middlewareName];
				let mdInstance = RequireByFormat(mdSetting.path);
				
				mdInstance = mdInstance.default || mdInstance;
				
				if(mdSetting.exec === true){
					mdInstance = mdInstance(this.config);	
				}
				
				let func = function (req, res, next){
					return mdInstance(req, res, next);
				}
				
				Object.defineProperty(func, 'name', {value: middlewareName, configurable: true});
				this.processChain.push(func);
			}.bind(this));
		}
	}
	
	runPrecessChain(callback) {	
		async.eachSeries(this.processChain, function middleware(mw, cb){
			mw(this.request, this.response, cb);
		}.bind(this), callback);
	}
	
	setRequest(request) {
		this.request = request;
	}
	
	setResponse(response) {
		this.response = response;
	}
	
	loadController(matchResult) {
		if(matchResult.controller !== null){
			let controllerPath = null;
			let controller = null;
			let controllerInstance = null;
			let srcIndex = 0;
			let hasResult = false;
			let loop = true;
			let middleSrc = "";
			const reqHeaders = this.request.headers || {};
			const reqCookies = this.request.cookies || {};
			
			matchResult.controller = Utils.capitalizeFirstLetter(matchResult.controller)+"Controller";
			matchResult.action = "action"+Utils.capitalizeFirstLetter(matchResult.action);
			
			try {
				while(loop){
					try{
						middleSrc = matchResult.controllerPath[srcIndex];
						
						if(/\./.test(middleSrc)){
							controller = RequireByFormat(middleSrc);
							controller = controller[matchResult.controller];
							controllerPath = FileUtil.findControllerPath(this.config.basePath, middleSrc);
							controllerPath = path.join(controllerPath, matchResult.controller);
						}else{
							middleSrc = "/"+middleSrc+"/";
							controllerPath = path.join(this.config.basePath, middleSrc + matchResult.controller);	
							controller = require(controllerPath);
						}
						
						if(controller){
							hasResult = true;
							loop = false;
						}
					}catch(e){
						srcIndex++;	
						
						if(srcIndex === matchResult.controllerPath.length){
							loop = false;
						}
					}
				}
				
				if(hasResult === false){
					throw new Error("Cannot find controller");
				}
			}catch(error){
				if(/Cannot find/.test(error.message)) {
					throw new NotFoundException("Cannot find controller '"+matchResult.controller+"'");
				} else {
					throw new ErrorException(error);
				}
			}

			controller = controller.default || controller;	
			controllerInstance = new controller();
			controllerInstance.setController(matchResult.controller);
			controllerInstance.setConfig(this.config);
			controllerInstance.setRequest(this.request);
			controllerInstance.setResponse(this.response);
			controllerInstance.setNowHttpMethod(this.request.method.toUpperCase());
			controllerInstance.setControllerPath(controllerPath);
			controllerInstance.setHeaderMap(reqHeaders);
			controllerInstance.setCookieMap(reqCookies);
			controllerInstance.initial(true);

			try{
				this.loadAction(matchResult, controllerInstance);		
			}catch(actionError) {
				if(/Cannot/.test(actionError.message) && !actionError.hasOwnProperty("code")){
					throw new NotFoundException("Cannot find action '"+matchResult.action+"' at '"+controllerInstance.controllerPath+"'");
				}else{
					throw new ErrorException(actionError);
				}
			}
		}else{
			this.noSomethingMatch();
		}
	}
	
	loadAction(matchResult, controllerInstance) {
		const action = controllerInstance[matchResult.action];
		const view = action.view || null;
		
		if(typeof action.method === 'string' && action.method.toUpperCase() !== this.request.method.toUpperCase()){
			throw new NotFoundException("Cannot find action '"+matchResult.action+"' at '"+controllerInstance.controllerPath+"'");
		}else if(typeof action.method === 'object'){
			if(action.method.indexOf(this.request.method.toUpperCase()) === -1){
				throw new NotFoundException("Cannot find action '"+matchResult.action+"' at '"+controllerInstance.controllerPath+"'");
			}
		}
		
		if(action.hasOwnProperty("login")) {
			Object.keys(action).map(function loopDocProp(prop) {
				controllerInstance.set(prop, action[prop]);
			});
			
			controllerInstance.afterContinue(function checkLogin(result){
				controllerInstance.setAction(matchResult.action);
				controllerInstance.setView(view);
				controllerInstance.setFilterResult(result);
				this.doAction(controllerInstance, action);
			}.bind(this));
			
			const LoginFilter = Lobenton.getComponent("loginFilter");
			LoginFilter.do(controllerInstance);
		}else {
			controllerInstance.setAction(matchResult.action);
			controllerInstance.setView(view);
			this.doAction(controllerInstance, action);
		}
	}
	
	doAction(controllerInstance, action) {
		const reqParams = this.request.params || {};
		const reqBody = this.request.body || {};
		const reqQuery = this.request.query || {};
		const reqErrorObject = this.request.errorObject || null;
		
		let actionArgs = [];
		const args = getParameterNames(action);
		let argsMerge = deepAssign(reqParams, reqQuery, reqBody);

		if(reqErrorObject !== null) {
			argsMerge["errorObject"] = reqErrorObject;
		}
			
		let paramMap = args.reduce(function(newObj, value, index){
			var paramName = value;
			
			if(argsMerge.hasOwnProperty(paramName)){
				actionArgs.push(argsMerge[paramName]);
				newObj[paramName] = argsMerge[paramName];
			}else{
				actionArgs.push(null);
				newObj[paramName] = null;
			}
			
			delete argsMerge[paramName];
			
			return newObj;
		}, {});
		
		paramMap = deepAssign(paramMap, argsMerge);
		
		controllerInstance.setParamMap(paramMap);
		controllerInstance.beforeAction.apply(controllerInstance, actionArgs);
		
		try {
			action.apply(controllerInstance, actionArgs);
		}catch(error){
			throw new ErrorException(error);
		}
		
		controllerInstance.afterAction.apply(controllerInstance, actionArgs);
	}
	
	noSomethingMatch() {
		const pathname = Utils.fixUrl(this.request).pathname;
		
		if(/.+\..+$/.test(pathname)){
			throw new NotFoundException("Cannot find file '"+pathname+"'");
		}else{
			throw new NotFoundException("Cannot find route '"+pathname+"'");
		}
	}
	
	exec(data, errorObject) {
		this.runPrecessChain(function processChainResult(errorMag){
			try {
				if(errorMag){
					throw new ErrorException(errorMag);
				}

				const pathname = Utils.fixUrl(this.request).pathname;
				const UrlManager = Lobenton.getComponent("urlManager");
				const matchResult = UrlManager.do(pathname);
				
				if(matchResult === "no impl!"){
					throw new Error("No impl 'do' for system call in UrlManager");
				}

				delete matchResult.paramMap.controller;
				delete matchResult.paramMap.action;
				
				this.request.params = matchResult.paramMap;
				
				if(typeof data === "object" && Object.keys(data).length > 0){
					this.request.query = data;
					this.request.body = {};
				}
				
				if(errorObject){
					this.request.errorObject = errorObject;
				}else{
					this.request.errorObject = null;
				}
				
				this.loadController(matchResult);
			}catch(error){
				let targetError = error.code ? error : new ErrorException(error);
				let defaultErrorController = "/"+this.config.defaultErrorController || "";
				Lobenton.getApp().forwardBridge(defaultErrorController, {}, this.request, this.response, targetError);
			}
		}.bind(this));
	}
}

export default RequestHandler;