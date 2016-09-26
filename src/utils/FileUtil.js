"use strict";

import fs from "fs";
import Utils from "./Utils.js";
import path from "path";
import {transform, transformFileSync} from "babel-core";

function getControllerName(source) {
	let docExec = new RegExp("class(\\w+)Controllerextends", "gi").exec(source);
	docExec = docExec || [];
	return Utils.lowerFirstLetter(docExec[1]) || null;
}

function getActionName(source) {
	let docExec = new RegExp("\\*action(\\w+)\\*", "gi").exec(source);
	docExec = docExec || [];
	return Utils.lowerFirstLetter(docExec[1]) || null;
}

function getActionFuctionName(source) {
	let docExec = new RegExp("\\*action(\\w+)\\*", "gi").exec(source);
	docExec = docExec || [];
	return docExec[1] ? "action"+docExec[1] : null;
}

function getControllerLayout(source) {
	let docExec = new RegExp("\\@layout\\:(((?!\\*).)*)\\*", "gi").exec(source);
	docExec = docExec || [];
	return docExec[1] || null;
	//const docExec = new RegExp("this\.layout\=(\"|\')(((?!\\*).)*)(\"|\')", "gi").exec(source);
	//return docExec[2] || null;
}

function getActionView(source) {
	let docExec = new RegExp("\\@view\\:(((?!\\*).)*)\\*", "gi").exec(source);
	docExec = docExec || [];
	return docExec[1] || null;
}

function isSourceHasLayout(source) {
	return /\@layout/g.test(source);
	//return /this\.layout/g.test(source);
}

function isSourceHasView(source) {
	return /\@view/g.test(source);
}

class FileUtil {
	static compiler(content){
		return transform(content, babelrc);
	}
	
	static compilerFile(src) {
		return transformFileSync(src, babelrc);
	}
	
	static writeFile(src, result) {
		return fs.writeFileSync(src, result.code);
	}
	
	static getFile(src, replaceSpace) {
		let buffer = fs.readFileSync(src, "utf8");
		
		if(replaceSpace !== false){	
			buffer = buffer.replace(/\s/g,"");
		}
		
		return buffer;
	}
	
	static getFileList(src) {
		try {
			return fs.readdirSync(src, "utf8")
		}catch(e){
			throw e;
		}
	}
	
	static isFile(src) {
		return fs.lstatSync(src).isFile();
	}
	
	static isJsFile(src) {
		return /\.js(x|)$/gi.test(src);
	}
	
	static isWindows(src) {
		return path.sep === "\\";
	}
	
	static getParamFromDoc(mtd, source) {
		let target = {};
		const docExec = new RegExp("\\/\\*\\*.+"+mtd+"\\*(.+)\\*\\/"+mtd + "(\\s+|)\\(", "gi").exec(source);
		
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
							let value = docToPatam[1];
							
							if(/\,/.test(value)){
								value = value.split(",");
								value = value.map(function(v){
									return v.toUpperCase();
								});
							}
							
							target[key] = value || "GET";
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
	
	static fixControllerLayout(target, source) {
		if(!source){
			source = FileUtil.getFile(target.controllerPath+".js");
		}
		
		const controllerLayout = getControllerLayout(source);
		
		target.layout = controllerLayout;
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
	
	static findControllerPath(basePath, expression) {
		const expressionArray = expression.split(".");
		let sourcePath = path.join(basePath, "./node_modules");
		sourcePath = path.resolve(sourcePath, "./"+expressionArray[0].replace(/\/.+/g,""));
		sourcePath = path.resolve(sourcePath, "./src/server");
		
		expressionArray.map(function(node, index){
			if(index !== 0){
				sourcePath = path.resolve(sourcePath, node);
			}
		});
		
		return sourcePath;
	}
}

let babelrc = FileUtil.getFile(".babelrc");
babelrc = JSON.parse(babelrc);

export default FileUtil;