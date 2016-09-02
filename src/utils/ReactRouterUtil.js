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
	
	transformToFile() {
		if(this.router !== null) {
			Object.keys(this.router).map(function loopRouteFirst(routeFirst) {
				const routeFirstValue = this.router[routeFirst];
				
				if(this.mainRouterArray.indexOf('\t\t\t<Route path="'+routeFirst+'" component={App}>') === -1){
					this.mainRouterArray.push('\t\t\t<Route path="'+routeFirst+'" component={App}>');
				}
				
				Object.keys(routeFirstValue).map(function loopSubRoute(subRoute){
					const routeValue = routeFirstValue[subRoute];
					const docParams = Object.keys(routeValue.docParams);
					const paramStr = docParams.reduce(function reduceParam(str, param, index) {
						if([true, false, "true", "false"].indexOf(routeValue.docParams[param]) !== -1){
							str += param+"={"+routeValue.docParams[param]+"} ";	
						}else{
							str += param+'="'+routeValue.docParams[param]+'" ';	
						}
						
						return str;
					}, "");
					
					if(this.importArray.indexOf('import '+routeValue.viewName+' from "'+routeValue.view+'";') === -1){
						this.importArray.push('import '+routeValue.viewName+' from "'+routeValue.view+'";');	
					}
					
					if(subRoute === "/"){
						this.mainRouterArray.push('\t\t\t\t<IndexRoute component={'+routeValue.viewName+'} '+paramStr+'/>');
					}else{
						if(/\/$/.test(subRoute) && subRoute !== '/'){
							subRoute = subRoute.replace(/\/$/,'');
						}
						this.mainRouterArray.push('\t\t\t\t<Route path="'+subRoute+'" component={'+routeValue.viewName+'} '+paramStr+'/>');
					}
				}.bind(this));
				
				this.mainRouterArray.push('\t\t\t</Route>');
				
			}.bind(this));
		}
	}
	
	getContent() {
		const result = this.importArray.concat(this.mainBeforeArray, this.mainRouterArray, this.mainAfterArray);
		return result.join("\r\n");
	}
}

export default ReactRouterUtil;