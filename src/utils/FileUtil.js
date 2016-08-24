"use strict";

import fs from "fs";
import Utils from "./Utils.js";

function getControllerName(source) {
	const docExec = new RegExp("class(\\w+)Controllerextends", "gi").exec(source);
	return Utils.lowerFirstLetter(docExec[1]) || null;
}

function getActionName(source) {
	const docExec = new RegExp("\\*action(\\w+)\\*", "gi").exec(source);
	return Utils.lowerFirstLetter(docExec[1]) || null;
}

function getActionFuctionName(source) {
	const docExec = new RegExp("\\*action(\\w+)\\*", "gi").exec(source);
	return docExec[1] ? "action"+docExec[1] : null;
}

function getControllerLayout(source) {
	const docExec = new RegExp("this\.layout\=(\"|\')(((?!\\*).)*)(\"|\')", "gi").exec(source);
	return docExec[2] || null;
}

function getActionView(source) {
	const docExec = new RegExp("\\@view\\:(((?!\\*).)*)\\*", "gi").exec(source);
	return docExec[1] || null;
}

function isSourceHasLayout(source) {
	return /this\.layout/g.test(source);
}

function isSourceHasView(source) {
	return /\@view/g.test(source);
}

class FileUtil {
	static getFile(path) {
		let buffer = fs.readFileSync(path, "utf8");
		buffer = buffer.replace(/\s/g,"");
		return buffer;
	}
	
	static getFileList(path) {
		try {
			return fs.readdirSync(path, "utf8")
		}catch(e){
			throw e;
		}
	}
	
	static getParamFromDoc(mtd, source) {
		let target = {};
		const docExec = new RegExp("\\/\\*\\*.+"+mtd+"\\*(.+)\\*\\/"+mtd, "gi").exec(source);
		
		if(docExec !== null){
			const docArray = typeof docExec[1] !== "undefined" ? docExec[1].split("*") : [];
			
			docArray.map(function loopDoc(doc) {
				if(/\:/.test(doc)) {
					const docToPatam = doc.split(":");
					const key = docToPatam[0].replace("@","");
					
					if([true, "true", false, "false"].indexOf(docToPatam[1]) !== -1){
						if([true, "true"].indexOf(docToPatam[1]) !== -1){
							docToPatam[1] = true;
						}else{
							docToPatam[1] = false;
						}
					}else if(/^\d+$/g.test(docToPatam[1])){
						docToPatam[1] /= 1;
					}
					
					switch(key){
						case 'login':
							target[key] = docToPatam[1] || false;
							break;
						case 'method':
							target[key] = docToPatam[1] || "GET";
							break;
						default:
							target[key] = docToPatam[1] || null;
							break;
					}
				}
			});
		}
		
		target["login"] = target["login"] || false;
		target["method"] = target["method"] || "GET";
				
		return target;
	}
	
	static fixControllerMethod(target, source) {
		if(!source){
			source = FileUtil.getFile(target.controllerPath+".js");
		}
		
		Utils.getAllMethods(target.constructor.prototype).forEach(function forEachPrototype(mtd) {
			if(mtd !== "constructor"){
				const docParams = FileUtil.getParamFromDoc(mtd, source);
				
				Object.keys(docParams).map(function loopDocParams(param){
					target[mtd][param] = docParams[param];
				});
			}
		});
	}
	
	static isControllerHasLayoutAndView(source) {
		return isSourceHasLayout(source) && isSourceHasView(source);
	}
	
	static getViewName(source) {
		const docSplit = source.split("/");
		const lastTwo = docSplit.slice(-2);
		return Utils.capitalizeFirstLetter(lastTwo[0])+Utils.capitalizeFirstLetter(lastTwo[1]);
	}
	
	static isSourceHasLoginTrue(source) {
		return /\@login\:true/g.test(source);
	}
	
	static getUrlPatternFromController(source){
		let docExec = null;
		let urlMap = {};
		const controllerName = getControllerName(source);
		const controllerLayout = getControllerLayout(source);
		const re = new RegExp("\\/\\*\\*((?!\\*\\/).)*\\*\\/", "gi");
		
		while(docExec = re.exec(source)){
			if(isSourceHasView(docExec[0])){
				const actionName = getActionName(docExec[0]);
				const actionFuctionName = getActionFuctionName(docExec[0]);
				const actionView = getActionView(docExec[0]);
				const url = controllerName + "/" + actionName;
				const docParams = FileUtil.getParamFromDoc(actionFuctionName, source);
				
				delete docParams.view;
				
				urlMap[url] = {
					controller : controllerName,
					action : actionName,
					layout : controllerLayout,
					view : actionView,
					docParams : docParams
				};
			}
		}
		
		return urlMap;
	}
}

export default FileUtil;