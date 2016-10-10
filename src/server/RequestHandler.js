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
	constructor(config, reactRouter) {
		this.controllerPath = null;
		this.reactRouter = reactRouter || null;
		this.config = config;
		this.request = null;
		this.response = null;
		this.staticFolder = this.config.staticFolder ? path.join(this.config.basePath, this.config.staticFolder) : path.join(this.config.basePath, "public");
		this.processChain = [
			compression(),
			serverStatic(this.staticFolder),
			Utils.fixQuery(),
			cookieParser(),
			bodyParser.json(),
			bodyParser.urlencoded({extended: true})
		];
		
		if(process.env.NODE_ENV === "dev" && !this.config.isStart && this.config.webpackDevConfig){
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
					mdInstance = mdInstance(this.config, mdSetting);	
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
		try {
			let controller = null;
			let srcIndex = 0;
			let hasResult = false;
			let loop = true;
			let middleSrc = "";
			
			matchResult.controller = Utils.capitalizeFirstLetter(matchResult.controller)+"Controller";
			matchResult.action = "action"+Utils.capitalizeFirstLetter(matchResult.action);
			
			while(loop){
				try{
					middleSrc = matchResult.controllerPath[srcIndex];
					
					if(/\./.test(middleSrc)){
						this.controllerPath = FileUtil.findControllerPath(this.config.basePath, middleSrc);
						this.controllerPath = path.join(this.controllerPath, matchResult.controller);
						controller = RequireByFormat(middleSrc);
						controller = controller[matchResult.controller];
					}else{
						middleSrc = "/"+middleSrc+"/";
						this.controllerPath = path.join(this.config.basePath, middleSrc + matchResult.controller);	
						controller = require(this.controllerPath);
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
				throw new NotFoundException("Cannot find controller '"+matchResult.controller+"'");
			}
			
			controller = controller.default || controller;	
			
			
			return controller;
		}catch(e){
			throw e;
		}
	}
	
	doController(matchResult, controller) {
		try {
			let controllerInstance = null;
			const reqHeaders = this.request.headers || {};
			const reqCookies = this.request.cookies || {};
			
			controllerInstance = new controller();
			controllerInstance.setController(matchResult.controller);
			controllerInstance.setConfig(this.config);
			controllerInstance.setReactRouter(this.reactRouter);
			controllerInstance.setRequest(this.request);
			controllerInstance.setResponse(this.response);
			controllerInstance.setNowHttpMethod(this.request.method.toUpperCase());
			controllerInstance.setControllerPath(this.controllerPath);
			controllerInstance.setHeaderMap(reqHeaders);
			controllerInstance.setCookieMap(reqCookies);
			controllerInstance.initial(true);
			
			return controllerInstance;
		}catch(e){
			throw e;
		}
	}
	
	loadAction(matchResult, controllerInstance) {
		try {
			const action = controllerInstance[matchResult.action];
			
			if(typeof action.method === 'string' && action.method.toUpperCase() !== this.request.method.toUpperCase()){
				throw new NotFoundException("Http method Error : Cannot find action '"+matchResult.action+"' at '"+matchResult.controller+"'; Url : "+this.request.url);
			}else if(typeof action.method === 'object'){
				if(action.method.indexOf(this.request.method.toUpperCase()) === -1){
					throw new NotFoundException("Http method Error : Cannot find action '"+matchResult.action+"' at '"+matchResult.controller+"'; Url : "+this.request.url);
				}
			}
			
			return action;
		}catch(e){
			throw e;
		}
	}
	
	doAction(matchResult, controllerInstance, action, paramObj) {
		try {
			if(action.hasOwnProperty("login")) {
				Object.keys(action).map(function loopDocProp(prop) {
					controllerInstance.set(prop, action[prop]);
				});
				
				controllerInstance.afterContinue(function checkLogin(result){
					try {
						controllerInstance.setAction(matchResult.action);
						controllerInstance.setFilterResult(result);
						controllerInstance.setParamMap(paramObj.paramMap);
						controllerInstance.beforeAction.apply(controllerInstance, paramObj.actionArgs);
						action.apply(controllerInstance, paramObj.actionArgs);
						controllerInstance.afterAction.apply(controllerInstance, paramObj.actionArgs);
					} catch (e1) {
						return this.execError({}, e1);
					}
				}.bind(this));
				
				const LoginFilter = Lobenton.getComponent("loginFilter");
				LoginFilter.do(controllerInstance);
			}else {
				controllerInstance.setAction(matchResult.action);
				controllerInstance.setParamMap(paramObj.paramMap);
				controllerInstance.beforeAction.apply(controllerInstance, paramObj.actionArgs);
				action.apply(controllerInstance, paramObj.actionArgs);
				controllerInstance.afterAction.apply(controllerInstance, paramObj.actionArgs);
			}
		}catch(e){
			throw e;
		}
	}
	
	fixArgs(action) {
		try {
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
			
			return {paramMap: paramMap, actionArgs: actionArgs};
		}catch(e){
			throw e;
		}
	}
	
	noSomethingMatch() {
		const pathname = Utils.fixUrl(this.request).pathname;
		
		if(/.+\..+$/.test(pathname)){
			throw new NotFoundException("File match error : Cannot find file '"+pathname+"'");
		}else{
			throw new NotFoundException("Route match error : Cannot find route '"+pathname+"'");
		}
	}
	
	testMatch() {
		let matchResult = null;
		let pathname = null;
		const UrlManager = Lobenton.getComponent("urlManager");
		
		if(this.request.hasOwnProperty("alreadyMatch")){
			matchResult = Object.assign({}, this.request.alreadyMatch);
			matchResult.paramMap = {};
			matchResult.controllerPath = UrlManager.getConfig().controllerPath;
		}else{
			pathname = Utils.fixUrl(this.request).pathname;
			matchResult = UrlManager.do(pathname);
			
			if(matchResult === "no impl!"){
				throw new Error("No impl 'do' for system call in UrlManager");
			}
		}

		delete matchResult.paramMap.controller;
		delete matchResult.paramMap.action;
		
		return matchResult;
	}
	
	finalError(error) {
		this.response.statusCode = error.code||500;
		this.response.setHeader('Content-Type', 'text/html');
		this.response.end("<pre>"+error.stack+"</pre>");
	}
	
	execError(data, error) {
		if(this.config.hasOwnProperty("defaultErrorController") && this.config.defaultErrorController !== ""){
			const controllerAction = this.config.defaultErrorController;
			const controllerActionArray = controllerAction.split("/");
			
			if(this.request.hasOwnProperty("alreadyMatch") && this.request.alreadyMatch.controller === controllerActionArray[0]){
				this.finalError(error);
			}else{
				this.request.method = "GET";
				const controllerAction = this.config.defaultErrorController;
				const controllerActionArray = controllerAction.split("/");
				
				if(controllerActionArray.length === 2){
					this.request.alreadyMatch = {
						controller: controllerActionArray[0],
						action: controllerActionArray[1]
					};
					data = data || {};
					data.code = error.code || 500;
					data.error_code = error.code || 500;
					data.message = error.message || "Server Error";
					data.error_message = error.message || "Server Error";
					Lobenton.getApp().forwardBridge(this.request.url, data, this.request, this.response, error);
				}else{
					this.finalError(new ErrorException("Forward error : Cannot find pattern '"+controllerAction+"'"));
				}
			}
		}else{
			this.finalError(error);
		}
	}
	
	exec(data, errorObject) {
		try {
			this.runPrecessChain(function processChainResult(errorMag){
				try {
					if(errorMag){
						throw new ErrorException(errorMag);
					}

					let matchResult = this.testMatch();
					
					this.request.params = matchResult.paramMap;
					this.request.errorObject = errorObject ? errorObject : null;
					
					if(typeof data === "object" && Object.keys(data).length > 0){
						this.request.query = data;
						this.request.body = {};
					}
					
					if(matchResult.controller !== null){
						let controller = this.loadController(matchResult);
						let controllerInstance = this.doController(matchResult, controller);
						let action = this.loadAction(matchResult, controllerInstance);
						let paramObj = this.fixArgs(action);
						this.doAction(matchResult, controllerInstance, action, paramObj);
					}else{
						this.noSomethingMatch();
					}
				}catch(e) {
					this.execError(data, e);
				}
			}.bind(this));
		}catch(error){
			this.execError(data, error);
		}
	}
}

export default RequestHandler;