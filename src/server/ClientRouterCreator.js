"use strict";

import fs from "fs";
import path from "path";
import FileUtil from "../utils/FileUtil.js";
import Utils from "../utils/Utils.js";
import ReactRouterUtil from "../utils/ReactRouterUtil.js";
import Lobenton, {BaseComponent} from 'lobenton';

function writeFile(path, content, callback) {
	const result = FileUtil.compiler(content);
	const err = FileUtil.writeFile(path, result);
	
	if(err) {
		console.log(err)
		callback(err);
		return;
	}

	console.log("The react router file was created at "+path+"!");
	callback();
	return;
}

class ClientRouterCreator extends BaseComponent {
	constructor () {
		super();
		this.callback = null;
		this.allUrl = {};
		this.registedUrl = [];
		this.urlManager = null;
		this.controllerMap = {};
	}
	
	setUrlManager(urlManager) {
		this.urlManager = urlManager;
	}
	
	initial() {
		try{
			this.urlManager.config.controllerPath.map(function loopPath(controllerPath, index){
				let sourcePath = null;
				
				if(/\./.test(controllerPath)){
					sourcePath = FileUtil.findControllerPath(this.config.basePath, controllerPath);
				}else{
					//for parser, so we need to use source
					controllerPath = controllerPath.replace(/^lib\//, "src/");
					sourcePath = path.join(this.config.basePath, controllerPath);
				}
				
				if(/node_modules/.test(sourcePath)){
					return;
				}
				
				const controllerList =  FileUtil.getFileList(sourcePath)
				
				controllerList.map(function loop(fileName) {
					const filePath = path.join(sourcePath, fileName);		
					this.addControllerToMap(filePath);
				}.bind(this));
			}.bind(this));
			
			this.buildRouter();
		}catch(e){console.log(e);}
	}
	
	renew(filePath) {
		try{
			this.allUrl = {};
			this.registedUrl = [];
			
			// HMR watching src, so we got src file path when change
			let re = path.join(this.config.basePath, "/src");
			let reController = path.join(this.config.basePath, "/src/server/controllers");

			if(path.sep === "\\"){
				re = re.replace(/\\/g,"\\\\");
				reController = reController.replace(/\\/g,"\\\\");
			}

			re = new RegExp(re, "gi");
			reController = new RegExp(reController, "gi");
			
			if(re.test(filePath)){
				if(reController.test(filePath)){
					this.addControllerToMap(filePath);	
				}
						
				this.buildRouter();
			}
		}catch(e){console.log(e);}
	}
	
	after(callback) {
		this.callback = callback;
	}
	
	addControllerToMap(filePath) {
		const fileSource = FileUtil.getFile(filePath);
		
		if(FileUtil.isControllerHasLayoutAndView(fileSource)){
			if(FileUtil.isSourceHasLoginTrue(fileSource)){
				try{
					Lobenton.getComponent("loginFilter");
				}catch(e){
					throw e;	
				}
			}
			
			const urlPattern = FileUtil.getUrlPatternFromController(fileSource);

			this.controllerMap[filePath] = {
				source: fileSource,
				urlPattern : urlPattern
			}
		}
	}
		
	buildRouter() {
		let self = this;
		let router = {subRules:{}};
		
		this.findMatchRoute(router, this.urlManager.config.rules);

		const noHandleUrl = Object.keys(this.allUrl).filter(function loop(url){
				return this.allUrl[url] !== null && this.registedUrl.indexOf(url) === -1;
			}.bind(this)).reduce(function loopNoHandle(newObj, url, index){
				newObj.push(url + " => " + Utils.capitalizeFirstLetter(this.allUrl[url].controller) + "Controller");
				return newObj;
			}.bind(this), []);
		
		if(noHandleUrl.length > 0){
			console.log("Following those routes you set in '"+Lobenton.configPath+ "' are no handler:\r\n\t"+noHandleUrl.join("\r\n\t")+"\r\n\r\n");
		}
		
		const str = ReactRouterUtil.createRouter(router);
		let createRouterFilepath = path.resolve(__dirname, "../../createRouter.js");
		
		if(this.config.hasOwnProperty("routerFolder") && this.config.routerFolder !== ""){
			 createRouterFilepath = path.join(this.config.basePath, this.config.routerFolder, "createRouter.js");
		}
		
		writeFile(createRouterFilepath, str, (err) => {
			if(err){
				throw err;
			}
			if(this.callback){
				this.callback();
			}
		});
	}
	
	findMatchRoute(router, currentMap) {
		Object.keys(currentMap).map(function loop(pattern){
			// 去除regex
			let patternValue = currentMap[pattern];
			pattern = /^\//.test(pattern) ? pattern : "/"+pattern;
		
			let result = null;
			let regexArray = [];
			let regexStr = '';
			const re = new RegExp("\\/(((?!\\/).)*)", "gi");

			while(result = re.exec(pattern)){
				let partResult = result[1];
				partResult = partResult.replace(/\(.+/g, '');
				regexArray.push(partResult);
			}
			
			// 轉成字串
			regexStr = "/"+regexArray.join("/");
			
			let extend = false;
			
			if(Array.isArray(patternValue)){
				if(patternValue.length > 1 && patternValue[1] === true){
					extend = true;
				}
				
				patternValue = patternValue[0];
			}
			
			// 如果值是字串
			if(typeof patternValue === 'string'){
				if(!this.allUrl.hasOwnProperty(patternValue)){
					this.allUrl[patternValue] = null;
				}
				
				// 所有 controller 檔案
				Object.keys(this.controllerMap).map(function loopFile(filePath) {
					const urlPattern = this.controllerMap[filePath].urlPattern;
					
					// controller 檔案內的組合
					Object.keys(urlPattern).map(function loopPattern(controllerAction) {
						let controllerActionValue = urlPattern[controllerAction];
						
						// 註冊在全部
						if(this.allUrl.hasOwnProperty(controllerAction)){
							this.allUrl[controllerAction] = controllerActionValue;
						}
						
						// 命中
						if(controllerAction === patternValue){
							// 註冊在已匹配
							if(this.registedUrl.indexOf(patternValue) === -1){
								this.registedUrl.push(patternValue);
							}else{
								//return;
							}
							
							// 如果是根目錄
							if(extend === true){
								router.pattern = {
									view: controllerActionValue.view,
									viewName: FileUtil.getViewName(controllerActionValue.view),
									docParams: controllerActionValue.docParams
								};
							}else{
								// 加入子目錄
								router.subRules[regexStr] = {
									pattern: {
										view: controllerActionValue.view,
										viewName: FileUtil.getViewName(controllerActionValue.view),
										docParams: controllerActionValue.docParams
									},
									subRules: null 
								}
							}
						}
					}.bind(this));
				}.bind(this));
			}else{
				// 新開一個物件
				router.subRules[regexStr] = {
					pattern: "",
					subRules: {}
				};
				this.findMatchRoute(router.subRules[regexStr], patternValue);
			}
		}.bind(this));
	}
}

export default ClientRouterCreator;