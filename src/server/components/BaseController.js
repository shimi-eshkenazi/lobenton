"use strict";

import cookie from "cookie";
import React from "react";
import deepAssign from "deep-assign";
import { combineReducers } from 'redux';
import ReactDOMServer from "react-dom/server";
import {RouterContext} from "react-router";
import {Provider} from "react-redux";
import {I18nextProvider}  from "react-i18next";
import BaseComponent from "./BaseComponent.js";
import FileUtil from "../../utils/FileUtil.js";
import RequireByFormat from "../utils/RequireByFormat.js";
import DeviceDetector from "../../utils/DeviceDetector.js";
import I18nDetector from "../../utils/I18nDetector.js";
import App from "../../client/components/App.js";
import topReducers from '../../client/reducers/index.js';
import ConfigureStore from "../../client/store/ConfigureStore.js";

let Lobenton = null;

class BaseController extends BaseComponent {
	constructor() {
		super();
		this.layout = null;
		this.view = null;
		this.controller = null;
		this.action = null;
		this.controllerPath = null;
		this.request = null;
		this.response = null;
		this.paramMap = {};
		this.headerMap = {};
		this.cookieMap = {};
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
		FileUtil.fixControllerMethod(this);
		
		if(fromRequest === true){
			this.deviceDetector  = new DeviceDetector();
			this.deviceDetector.setDefaultDevice(DeviceDetector.DESKTOP);
			this.deviceDetector.detect(this.request);
			this.deviceDetectorInstance = this.deviceDetector.getRealInstance();
			this.device = this.deviceDetector.getDevice();
			
			this.i18nDetector = new I18nDetector();
			this.i18nDetector.setDefaultLanguage(I18nDetector.ZHTW);
			this.i18nDetector.setLocalesPath("src/client/locales");
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
	
	setResponse (response) {
		this.response = response;
	}
	
	setView (view) {
		this.view = view;
	}
	
	setFilterResult (filterResult) {
		this.filterResult = filterResult;
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
	
	getProtocol() {
		var proto = this.request.connection.encrypted ? 'https'  : 'http';
		proto = this.request.headers['X-Forwarded-Proto'] || proto;
		return proto.split(/\s*,\s*/)[0];
	}
	
	getHost() {
		return this.request.headers.host;
	}
	
	sendBody(statusCode, body){
		this.response.statusCode = statusCode;
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
	
	dispatchToStore(sourceState) {
		let mainReducers = require('src/client/reducers');
		mainReducers = mainReducers.default || mainReducers;

		this.state = Object.assign(this.state, sourceState);
		this.state["language"] = this.language;
		this.state["history"] = {
			prevUrl: (this.request.query.r || this.request.headers['referer'] || '/'),
			currentUrl: this.request.url
		};
		
		this.store = ConfigureStore(function rootReducer(state, action) {
			let topResult = topReducers(state, action);
			let mainResult = mainReducers(state, action);
			let result = deepAssign(mainResult, topResult);
			return result;
		}.bind(this), [], this.state);
		
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
				throw new Error("Arguments of controller render must be object, " + sourceStateType + " given.");
			}
		}else{
			var passToLayoutWithoutReduxType = typeof passToLayoutWithoutRedux;
			if (passToLayoutWithoutReduxType !== 'object') {
				throw new Error("Argument 1 of controller render must be object, " + passToLayoutWithoutReduxType + " given.");
			}
			
			var sourceStateType = typeof sourceState;
			if (sourceStateType !== 'object') {
				throw new Error("Argument 2 of controller render must be object, " + sourceStateType + " given.");
			}
		}
		
		try{
			let layoutSource = "";
			let viewSource = "";
			
			sourceState = sourceState || {};
			
			if(this.layout){
				layoutSource = require(this.layout);
			}else{
				throw new Error("Layout is not defined on action : " + this.layout);
			}
			
			if(this.view){
				viewSource = require(this.view);
			}else{
				throw new Error("View is not defined on action : " + this.action);
			}
			
			sourceState = this.beforeRender(sourceState);
			sourceState = this.dispatchToStore(sourceState);
			layoutSource = layoutSource.default || layoutSource;
			viewSource = viewSource.default || viewSource;
			passToLayoutWithoutRedux.reduxState = JSON.stringify(sourceState);
			
			const view = React.createElement(viewSource, passToLayoutWithoutRedux);
			const layout = React.createElement(layoutSource, passToLayoutWithoutRedux, view);
			const app = React.createElement(App, {}, layout);
			const i18nextProvider = React.createElement(I18nextProvider, { i18n : this.i18nDetectorInstance }, app);
			const provider = React.createElement(Provider, { store : this.store }, i18nextProvider);
			
			let html = ReactDOMServer.renderToString(provider);
			html = '<!DOCTYPE lang="en">'+html;
			
			if(this.i18nDetector.getNeedSetCookie() === true){
				this.cookie('locale', I18nDetector.ZHTW, { maxAge: 900000, httpOnly: false });
			}
			
			html = this.afterRender(html);
			this.response.setHeader('Content-Type', 'text/html');
			this.response.setHeader('X-Powered-By', 'Lobenton');
			this.sendBody(200, html);
		}catch(error){
			console.log(error);
			throw error;
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
		this.response.setHeader('Set-Cookie', cookie.serialize(name, String(value), options));
	}
	
	createUrl(path) {
		if(/^\//.test(path)){
			return this.getProtocol()+"://"+this.getHost()+path;
		}else{
			return this.getProtocol()+"://"+this.getHost()+"/"+path;
		}
	}
	
	location(path) {
		let targetUrl = "";
		
		if(/^http.+/.test(path)){
			targetUrl = path;
		}else if(/^\/\/.+/.test(path)){
			targetUrl = this.getProtocol() + path;
		}else {
			targetUrl = this.createUrl(path);
		}
		
		this.response.setHeader('Location', targetUrl);
		this.sendBody(200, "");
	}
	
	redirect(path) {
		let address = path;
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
	
	forward(path, data) {
		if(!Lobenton){
			Lobenton = require("lobenton");
			Lobenton = Lobenton.default || Lobenton;
		}

		path = "/"+path || "";
		data = data || {};
		Lobenton.getApp().forwardBridge(path, data, this.request, this.response);
	}
	
	beforeAction() {}
	
	afterAction() {}
	
	beforeRender(sourceState) {
		return sourceState;
	}
	
	afterRender(html) {
		return html;
	}
}

export default BaseController;