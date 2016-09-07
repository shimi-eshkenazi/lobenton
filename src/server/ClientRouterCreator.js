"use strict";

import fs from "fs";
import path from "path";
import FileUtil from "../utils/FileUtil.js";
import Utils from "../utils/Utils.js";
import ReactRouterUtil from "../utils/ReactRouterUtil.js";
import Lobenton, {BaseComponent} from 'lobenton';

function writeFile(path, content) {
	fs.writeFile(path, content, function(err) {
		if(err) {
			return console.log(err);
		}

		console.log("The react router file was created at "+path+"!");
	});
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
	
	initial(build) {
		try{
			this.urlManager.config.controllerPath.map(function loopPath(controllerPath, index){
				let sourcePath = null;
				
				if(/\./.test(controllerPath)){
					sourcePath = FileUtil.findControllerPath(this.config.basePath, controllerPath);
				}else{
					sourcePath = path.join(this.config.basePath, controllerPath);
				}
				
				const controllerList =  FileUtil.getFileList(sourcePath)
				
				controllerList.map(function loop(fileName) {
					const filePath = path.join(sourcePath, fileName);		
					this.addControllerToMap(filePath, build);
				}.bind(this));
			}.bind(this));
			
			if(build === true){
				this.buildRouter();
			}	
		}catch(e){console.log(e);}
	}
	
	renew(filePath) {
		try{
			this.allUrl = {};
			this.registedUrl = [];
			
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
	
	addControllerToMap(filePath, build) {
		const fileSource = FileUtil.getFile(filePath);
		
		if(build === true && FileUtil.isControllerHasLayoutAndView(fileSource)){
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
		const filepath = path.resolve(__dirname, "../../createRouter.js");
		writeFile(filepath, str);
		
		if(this.callback){
			this.callback();
		}
	}
	
	findMatchRoute(router, currentMap) {
		let hasExtend = currentMap.hasOwnProperty("extend") ? true : false;
		
		Object.keys(currentMap).map(function loop(pattern){
			if(pattern === 'extend'){
				return;
			}
			
			const patternValue = currentMap[pattern];
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
			
			regexStr = "/"+regexArray.join("/");
		
			if(typeof patternValue === 'string'){
				if(!this.allUrl.hasOwnProperty(patternValue)){
					this.allUrl[patternValue] = null;
				}
				
				Object.keys(this.controllerMap).map(function loopFile(filePath) {
					const urlPattern = this.controllerMap[filePath].urlPattern;
					
					Object.keys(urlPattern).map(function loopPattern(controllerAction) {
						let controllerActionValue = urlPattern[controllerAction];
						
						if(this.allUrl.hasOwnProperty(controllerAction)){
							this.allUrl[controllerAction] = controllerActionValue;
						}
						
						if(controllerAction === patternValue){
							if(this.registedUrl.indexOf(patternValue) === -1){
								this.registedUrl.push(patternValue);
							}
							
							if(pattern === '/' && hasExtend){
								router.pattern = {
									view: controllerActionValue.view,
									viewName: FileUtil.getViewName(controllerActionValue.view),
									docParams: controllerActionValue.docParams
								};
							}else{
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