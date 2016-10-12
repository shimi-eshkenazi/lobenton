"use strict";

import path from "path";
import cookie from "cookie";
import React from "react";
import deepAssign from "deep-assign";
import { combineReducers } from 'redux';
import ReactDOMServer from "react-dom/server";
import {match, RouterContext, useRouterHistory} from "react-router";
import {Provider} from "react-redux";
import {I18nextProvider}  from "react-i18next";
import { createMemoryHistory, useQueries } from 'history';
import NotFoundException from "../../exceptions/NotFoundException.js";
import asyncBeApi from "./asyncBeApi.js";
import BaseComponent from "./BaseComponent.js";
import FileUtil from "../../utils/FileUtil.js";
import DeviceDetector from "../../utils/DeviceDetector.js";
import I18nDetector from "../../utils/I18nDetector.js";
import App from "../../client/components/App.js";
import ConfigureStore from "../../client/store/ConfigureStore.js";

let Lobenton = null;

class BaseController extends BaseComponent {
	constructor() {
		super();
		this.layout = null;
		this.controller = null;
		this.action = null;
		this.controllerPath = null;
		this.request = null;
		this.response = null;
		this.reactRouter = null;
		this.httpMethod = null;
		this.httpCode = null;
		this.paramMap = {};
		this.headerMap = {};
		this.cookieMap = {};
		this.setCookie
		this.store = null;
		this.state = {};
		this.tmp = {};
		this.filterResult = null;
		this.device = null;
		this.deviceDetector = null;
		this.deviceDetectorInstance = null;
		this.language = null;
		this.i18nDetector= null;
		this.i18nDetectorInstance = null;
		this.afterContinueCallback = null;
	}
	
	initial(fromRequest) {
		if (path.sep === "\\") {
        this.controllerPath = this.controllerPath.replace(/\\lib\\/g,"\\src\\");
    }else{
        this.controllerPath = this.controllerPath.replace(/\/lib\//g,"/src/");
    }
		
		if(!this.layout){
			FileUtil.fixControllerLayout(this);
		}
		
		FileUtil.fixControllerMethod(this);
		
		if(this.config.webpackDevConfig && fromRequest === true){
			this.deviceDetector  = new DeviceDetector();
			this.deviceDetector.setDefaultDevice(DeviceDetector.DESKTOP);
			this.deviceDetector.detect(this.request);
			this.deviceDetectorInstance = this.deviceDetector.getRealInstance();
			this.device = this.deviceDetector.getDevice();
			
			this.i18nDetector = new I18nDetector();
			this.i18nDetector.setDefaultLanguage(I18nDetector.ZHTW);
			this.i18nDetector.setLocalesPath(this.config.i18nFolder);
			this.i18nDetector.detect(this.cookieMap);
			this.i18nDetectorInstance = this.i18nDetector.getRealInstance();
			this.language = this.i18nDetector.getLanguage();
		}
	}
	
	setControllerPath(controllerPath) {
		this.controllerPath = controllerPath;
	}
	
	setRequest (request) {
		this.request = request;
	}
	
	getRequest () {
		return this.request;
	}
	
	setResponse (response) {
		this.response = response;
	}
	
	getResponse () {
		return this.response;
	}
	
	setReactRouter(reactRouter) {
		this.reactRouter = reactRouter;
	}
	
	setFilterResult (filterResult) {
		this.filterResult = filterResult;
	}
	
	setHttpCode(httpCode){
		this.httpCode = httpCode;
	}
	
	set(key, value) {
		this.tmp[key] = value;
	}
	
	get(key) {
		return this.tmp[key];
	}
	
	setController(controller) {
		this.controller = controller;
	}
	
	getController() {
		return this.controller;
	}
	
	setAction(action) {
		this.action = action;
	}
	
	getAction() {
		return this.action;
	}
	
	setHeaderMap(headerMap) {
		this.headerMap = headerMap;
	}
	
	getHeaderMap() {
		return this.headerMap;
	}
	
	setCookieMap(cookieMap) {
		this.cookieMap = cookieMap;
	}
	
	getCookieMap() {
		return this.cookieMap;
	}
	
	setParamMap(paramMap) {
		this.paramMap = paramMap;
	}
	
	getParamMap() {
		return this.paramMap;
	}
	
	setNowHttpMethod(httpMethod){
		this.httpMethod = httpMethod;
	}
	
	getNowHttpMethod(){
		return this.httpMethod;
	}
	
	getProtocol() {
		var proto = this.request.connection.encrypted ? 'https'  : 'http';
		proto = this.request.headers['X-Forwarded-Proto'] || proto;
		return proto.split(/\s*,\s*/)[0];
	}
	
	getHost() {
		return this.request.headers.host;
	}
	
	sendBody(statusCode, body){
		if(this.httpCode !== null){
			this.response.statusCode = this.httpCode;
		}else{
			this.response.statusCode = statusCode;
		}
		
		this.response.end(body, "UTF-8");
	}
	
	continue(result) {
		this.afterContinueCallback(result)
	}
	
	afterContinue(callback) {
		this.afterContinueCallback = callback;
	}
	
	setState(reducerName, state) {
		this.state[reducerName] = state;
	}
	
	connect(actionMap) {
		const self = this;
		const list = Object.keys(actionMap);
		
		if(list.length > 0){
			list.map((action, index) => {
				actionMap[action].load = function load() {
					if(self.store === null){
						self.dispatchToStore();
					}
					
					const result = actionMap[action].apply(this, arguments);
					return self.store.dispatch(result);
				}
			});
		}
	}
	
	dispatchToStore(sourceState) {
		const reducerSrc = process.env.NODE_ENV === "dev" && !this.config.isStart ? "src/client/reducers" : "lib/client/reducers";
		let mainReducers = require(reducerSrc);
		mainReducers = mainReducers.default || mainReducers;
		
		sourceState = sourceState || {};
		
		this.state = Object.assign(this.state, sourceState);
		this.state["language"] = this.language;
		this.state["history"] = {
			prevUrl: (this.request.query.r || this.request.headers['referer'] || '/'),
			currentUrl: this.request.url
		};
		
		if(/logout/g.test(this.state.history.prevUrl)){
			this.state.history.prevUrl = "/";
		}
		
		this.store = ConfigureStore(mainReducers, [asyncBeApi(this.config, this.request)], this.state);
		
		return this.store.getState();
	}
	
	render(passToLayoutWithoutRedux, sourceState){
		if (!passToLayoutWithoutRedux && !sourceState) {
			passToLayoutWithoutRedux = {};
			sourceState = {};
		}else if (passToLayoutWithoutRedux && !sourceState) {
			sourceState = passToLayoutWithoutRedux;
			passToLayoutWithoutRedux = {};
			
			var sourceStateType = typeof sourceState;
			if (sourceStateType !== 'object') {
				throw new Error("Render Error : Arguments of controller render must be object, " + sourceStateType + " given.");
			}
		}else{
			var passToLayoutWithoutReduxType = typeof passToLayoutWithoutRedux;
			if (passToLayoutWithoutReduxType !== 'object') {
				throw new Error("Render Error : Argument 1 of controller render must be object, " + passToLayoutWithoutReduxType + " given.");
			}
			
			var sourceStateType = typeof sourceState;
			if (sourceStateType !== 'object') {
				throw new Error("Render Error : Argument 2 of controller render must be object, " + sourceStateType + " given.");
			}
		}
		
		try{
			let layoutSource = "";
			let viewSource = "";
			let history = useRouterHistory(useQueries(createMemoryHistory))();
			let location = history.createLocation(this.request.url);
			let routes = this.reactRouter(history);
			
			sourceState = sourceState || {};
			
			if(this.store){
				const state = this.store.getState();
				sourceState = Object.assign(state, sourceState);
				this.store = null;
			}
			
			if(this.layout){
				// here is reading property give by user
				this.layout = (process.env.NODE_ENV === "dev" && !this.config.isStart) ? this.layout : this.layout.replace(/^src\//, "lib/");
				layoutSource = require(this.layout);
			}else{
				throw new Error("Render Error : Layout is not defined on action : " + this.layout);
			}

			sourceState = this.beforeRender(sourceState);
			sourceState = this.dispatchToStore(sourceState);
			layoutSource = layoutSource.default || layoutSource;
			passToLayoutWithoutRedux.reduxState = sourceState;
			
			match({ routes, location }, function matchHandle(error, redirectLocation, renderProps){
				try{
					if (redirectLocation) {
						this.redirect(301, redirectLocation.pathname + redirectLocation.search);
					} else if (error) {
						throw error;
					} else if (!renderProps) {
						throw new NotFoundException("Render Error : Route match error : Cannot find route '"+this.request.url+"'");
					} else {
						const routerContext = React.createElement(RouterContext, Object.assign({}, renderProps));
						const i18nextProvider1 = React.createElement(I18nextProvider, { i18n : this.i18nDetectorInstance }, routerContext);
						const provider1 = React.createElement(Provider, { store : this.store }, i18nextProvider1);
						const container = ReactDOMServer.renderToString(provider1);
						
						const layout = React.createElement(layoutSource, passToLayoutWithoutRedux, container);
						const i18nextProvider2 = React.createElement(I18nextProvider, { i18n : this.i18nDetectorInstance }, layout);
						const provider2 = React.createElement(Provider, { store : this.store }, i18nextProvider2);
						
						let html = ReactDOMServer.renderToStaticMarkup(provider2);
						html = '<!DOCTYPE lang="en">'+html;
						
						if(this.i18nDetector.getNeedSetCookie() === true){
							this.cookie('locale', I18nDetector.ZHTW, { maxAge: 900000, httpOnly: false });
						}
						
						html = this.afterRender(html);
						this.response.setHeader('Content-Type', 'text/html');
						this.response.setHeader('X-Powered-By', 'Lobenton');
						this.sendBody(200, html);
					}
				}catch(jsxError){
					throw jsxError;
				}
			}.bind(this));
		}catch(renderError){
			throw renderError;
		}
	}
	
	json(result, callbackName) {
		if(typeof callbackName !== "undefined"){
			return this.jsonp(result, callbackName);
		}
		
		const paramMap = this.getParamMap();
		if(typeof paramMap.callback !== "undefined"){
			return this.jsonp(result, paramMap.callback);
		}
		
		this.response.setHeader('Content-Type', 'application/json');
		this.sendBody(200, JSON.stringify(result));
	}
	
	jsonp(result, callbackName) {
		this.response.setHeader('Content-Type', 'application/javascript');
		this.sendBody(200, callbackName+"("+JSON.stringify(result)+")");
	}
	
	download(fileName){
		this.sendBody(200, fileName);
	}
	
	cookie(name, value, options) {
		let cookieList = this.response.getHeader('Set-Cookie');
		options = options || {};
		
		if(cookieList){
			cookieList.push(cookie.serialize(name, String(value), options));
		}else{
			cookieList = [cookie.serialize(name, String(value), options)];
		}
		
		this.response.setHeader('Set-Cookie', cookieList);
	}
	
	clearCookie(name) {
		this.cookie(name, "", {maxAge: -900000, httpOnly: false });
	}
	
	createUrl(urlPath) {
		if(/^\//.test(urlPath)){
			return this.getProtocol()+"://"+this.getHost()+urlPath;
		}else{
			return this.getProtocol()+"://"+this.getHost()+"/"+urlPath;
		}
	}
	
	location(urlPath) {
		let targetUrl = "";
		
		if(/^http.+/.test(urlPath)){
			targetUrl = urlPath;
		}else if(/^\/\/.+/.test(urlPath)){
			targetUrl = this.getProtocol() + urlPath;
		}else {
			targetUrl = this.createUrl(urlPath);
		}
		
		this.response.setHeader('Location', targetUrl);
		this.sendBody(200, "");
	}
	
	redirect(urlPath) {
		let address = urlPath;
		let status = 302;

		if (arguments.length === 2) {
			if (typeof arguments[0] === 'number') {
				status = arguments[0];
				address = arguments[1];
			} else {
				status = arguments[1];
			}
		}
		
		this.response.setHeader('Location', address);
		this.sendBody(status, "");
	}
	
	forwardUrl(urlPath, data) {
		if(!Lobenton){
			Lobenton = require("lobenton");
			Lobenton = Lobenton.default || Lobenton;
		}

		urlPath = (((/^\/.+/.test(urlPath))?"":"/")+urlPath) || "";
		data = data || {};
		Lobenton.getApp().forwardBridge(urlPath, data, this.request, this.response);
	}
	
	forward(controllerAction, data) {
		if(!Lobenton){
			Lobenton = require("lobenton");
			Lobenton = Lobenton.default || Lobenton;
		}

		const controllerActionArray = controllerAction.split("/");
		
		if(controllerActionArray.length === 2){
			this.request.alreadyMatch = {
				controller: controllerActionArray[0],
				action: controllerActionArray[1]
			};
			data = data || {};
			Lobenton.getApp().forwardBridge(this.request.url, data, this.request, this.response);
		}else{
			throw new ErrorException("Forward error : Cannot find pattern '"+controllerAction+"'");
		}
	}
	
	beforeAction() {
		
	}
	
	afterAction() {
		
	}
	
	beforeRender(sourceState) {
		return sourceState;
	}
	
	afterRender(html) {
		return html;
	}
}

export default BaseController;