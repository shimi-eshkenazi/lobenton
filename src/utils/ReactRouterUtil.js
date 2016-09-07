"use strict";

class ReactRouterUtil {
	static createRouter(routers) {
		let reactRouterUtil = new ReactRouterUtil();
		reactRouterUtil.setRouter(routers);
		reactRouterUtil.transformToFile();
		
		return reactRouterUtil.getContent();
	}
	
	constructor() {
		this.router = null;
		this.importArray = [
			'"use strict";',
			'',
			'import {App} from "lobenton/client";',
			'import React from "react";',
			'import { Router, Route, IndexRoute, browserHistory } from "react-router";'
		];
		this.mainBeforeArray = [
			'',
			'export const ts = '+ ((new Date()).getTime()) + ";",
			'export default function createRouter() {',
			'\treturn (',
			'\t\t<Router history={browserHistory}>'
		];
		this.mainRouterArray = [];
		this.mainAfterArray = [
			'\t\t</Router>',
			'\t);',
			'};'
		];
	}
	
	setRouter(router) {
		this.router = router;
	}
	
	toJsxRoute(target, prefixName, tab) {
		let isAddTab = false;
		prefixName = prefixName || '';
		
		Object.keys(target).map(function loopRoute(route) {
			const routeValue = target[route];
			const docParams = routeValue.pattern ? Object.keys(routeValue.pattern.docParams) : [];
			const paramStr = docParams.reduce(function reduceParam(str, param, index) {
				if([true, false, "true", "false"].indexOf(routeValue.pattern.docParams[param]) !== -1){
					str += param+"={"+routeValue.pattern.docParams[param]+"} ";	
				}else{
					str += param+'="'+routeValue.pattern.docParams[param]+'" ';	
				}
				
				return str;
			}, "");
			
			if(routeValue.pattern !== '' && routeValue.subRules !== null){
				if(this.importArray.indexOf('import '+routeValue.pattern.viewName+' from "'+routeValue.pattern.view+'";') === -1){
					this.importArray.push('import '+routeValue.pattern.viewName+' from "'+routeValue.pattern.view+'";');	
				}
				
				this.mainRouterArray.push(tab+'<Route path="'+(prefixName+route)+'" component={'+routeValue.pattern.viewName+'} '+paramStr+'>');
				this.toJsxRoute(routeValue.subRules, "", tab+"\t");
				this.mainRouterArray.push(tab+'</Route>');
			}else if(routeValue.pattern !== '' && routeValue.subRules === null){
				if(this.importArray.indexOf('import '+routeValue.pattern.viewName+' from "'+routeValue.pattern.view+'";') === -1){
					this.importArray.push('import '+routeValue.pattern.viewName+' from "'+routeValue.pattern.view+'";');	
				}
				
				if(prefixName+route === "/"){
					this.mainRouterArray.push(tab+'<IndexRoute component={'+routeValue.pattern.viewName+'} '+paramStr+'/>');
				}else{
					if(route === "/"){
						this.mainRouterArray.push(tab+'<Route path="'+(prefixName)+'" component={'+routeValue.pattern.viewName+'} '+paramStr+'/>');	
					}else{
						this.mainRouterArray.push(tab+'<Route path="'+(prefixName+route)+'" component={'+routeValue.pattern.viewName+'} '+paramStr+'/>');
					}
				}
			}else if(routeValue.pattern === '' && routeValue.subRules !== null){
				this.toJsxRoute(routeValue.subRules, route, tab);
			}
		}.bind(this));
	}
	
	transformToFile() {
		if(this.router !== null) {
			this.mainRouterArray.push('\t\t\t<Route path="/" component={App}>');
			this.toJsxRoute(this.router.subRules, "", '\t\t\t\t');
			this.mainRouterArray.push('\t\t\t</Route>');
		}
	}
	
	getContent() {
		const result = this.importArray.concat(this.mainBeforeArray, this.mainRouterArray, this.mainAfterArray);
		return result.join("\r\n");
	}
}

export default ReactRouterUtil;