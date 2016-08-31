"use strict";

import deepAssign from "deep-assign";
import Utils from "../../utils/Utils.js";
import {BaseComponent} from 'lobenton';

function targetToMap(ruleValue) {
	let result = null;
	let targetMap = {};
	const re = new RegExp("\\/(((?!\\/).)*)", "gi");
	
	ruleValue = /^\//.test(ruleValue) ? ruleValue : "/"+ruleValue;
	
	while(result = re.exec(ruleValue)){
		if(result["index"] === 0){
			targetMap['controller'] = result[1];
		} else {
			targetMap['action'] = result[1];
		}
	}
	
	return {mapping: targetMap};
}

function patternToMap(pattern) {
	if(!pattern){
		return {regex: "", mapping: {}};
	}
	
	let result = null;
	let patternMap = {};
	let regexArray = [];
	const re = new RegExp("\\/(((?!\\/).)*)", "gi");
	
	pattern = /^\//.test(pattern) ? pattern : "/"+pattern;
	
	while(result = re.exec(pattern)){
		let partResult = result[1];

		if(/^\:/.test(partResult)){
			const paramRe = new RegExp("^\\:(.+)(\\(.+\\))");
			
			if(!paramRe.test(partResult)){
				partResult = partResult+"(\w+)";
			}
			
			const paramReResult = paramRe.exec(partResult);
			
			patternMap[paramReResult[1]] = paramReResult[2];
			regexArray.push(paramReResult[2]);
		}else{
			if(partResult === "*"){
				patternMap[partResult] = "(|.+)";

				if (partResult) {
					regexArray.push("(|.+)");
				}
			}else{
				if (/^\d+$/g.test(partResult)) {
					patternMap["d" + partResult] = "(" + partResult + ")";
				}else{
					patternMap[partResult] = "(" + partResult + ")";
				}

				if (partResult) {
					regexArray.push("(" + partResult + ")");
				}	
			}
		}
	}

	let regexStr = "\\/"+regexArray.join('\\/');
	
	return {regex: regexStr, mapping: patternMap};
}

function toRuleMap(rule, ruleValue) {
	if(typeof ruleValue === "object"){
		return Object.keys(ruleValue).reduce(function loopRule(newObj, subRuleHasRegex, subRuleHasRegexIndex) {
			const ruleValueMap = toRuleMap(subRuleHasRegex, ruleValue[subRuleHasRegex]);
			
			Object.keys(ruleValueMap).map(function loop(ruleValueMapRegex){
				const ruleMap =  patternToMap(rule);
				const ruleValueMapMapping = ruleValueMap[ruleValueMapRegex];
				
				if(ruleMap.regex){
					let newMapping = ruleMap.mapping;
					
					Object.keys(ruleValueMapMapping).map(function loopParam(param) {
						newMapping[param] = ruleValueMapMapping[param];
					});
					
					newObj[ruleMap.regex+ruleValueMapRegex] = newMapping;
				}else{
					newObj[ruleValueMapRegex] = ruleValueMapMapping;	
				}
			});
			
			return newObj;
		}, {});
	}else{
		const ruleMap = patternToMap(rule);
		const ruleValueMap = targetToMap(ruleValue);
		
		return {[ruleMap.regex] : deepAssign(ruleMap.mapping, ruleValueMap.mapping)};
	}
} 

class WebAppUrlManager extends BaseComponent {
	constructor() {
		super();
		this.rulesRegex = {};
	}
	
	initial() {
		if(this.config.rules !== null) {
			this.rulesRegex = toRuleMap("", this.config.rules);
		}
	}
	
	do(pathname) {
		const rulesRegex = Object.keys(this.rulesRegex);
		let alreadyMatched = false;
		let matchResult = {
			controller : null,
			action : null,
			paramMap: {}
		};
		
		pathname = pathname === "/" ? "/" : pathname.replace(/\/$/,"");

		if(!pathname || Object.keys(rulesRegex).length === 0 || (pathname && /\.\w+$/.test(pathname))) {
			return matchResult;
		}

		rulesRegex.map(function loopRule(rule) {
			const testRegex = new RegExp("^"+rule+"$");
			const result = testRegex.exec(pathname);

			if(result !== null && !alreadyMatched){
				const ruleValue = this.rulesRegex[rule];

				matchResult.paramMap = Object.keys(ruleValue).reduce(function getResult(newObj, key, index){
					const value = ruleValue[key];
					const re = new RegExp(value, "gi");
					const param = /^d(\d+)$/.test(key) ? key.replace(/^d/, "") : key;
					
					if(re.test(result[index+1])){
						if(param !== result[index+1]){
							newObj[param] = result[index+1];
						}
					}else{
						newObj[param] = value;
					}
					
					return newObj;
				}, {});
				
				alreadyMatched = true;
			}
		}.bind(this));
		
		if(matchResult.paramMap.controller){
			matchResult.controller = matchResult.paramMap.controller;
			matchResult.action = matchResult.paramMap.action;	
		}

		return matchResult;
	}
}

export default WebAppUrlManager;