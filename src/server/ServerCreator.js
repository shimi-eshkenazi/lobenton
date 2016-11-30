"use strict";

import http from 'http';
import AppCreator from './AppCreator.js';
import {BaseComponent} from 'lobenton';
import Utils from "../utils/Utils.js";

class ServerCreator extends BaseComponent {
	constructor() {
		super();
		this.server = null;
		this.app = null;
	}
	
	initial() {
		const beforeAppRunList = Utils.keep("beforeAppRun");
		beforeAppRunList.map((beforeAppRun)=>{
			beforeAppRun();
		});
		
		this.app = new AppCreator(); 
		
		if(process.env.NODE_ENV === "dev" && !this.config.isStart){
			let HMR = require("./HMR.js");
			HMR = HMR.default || HMR;
			
			HMR.change(function change() {
				this.app.setConfig(this.config);
			}.bind(this));
		}
		
		this.app.setConfig(this.config);
		this.app.initial();

		this.server = http.createServer(this.app.handleRequest.bind(this.app));
		this.server.listen(this.config.port);
		this.server.on('error', this.onError.bind(this));
		this.server.on('listening', this.onListening.bind(this));
		
		return this.getServer();
	}
	
	initialSimple(router) {
		const beforeAppRunList = Utils.keep("beforeAppRun");
		beforeAppRunList.map((beforeAppRun)=>{
			beforeAppRun();
		});
		
		this.app = new AppCreator(); 
		this.app.setConfig(this.config);
		this.app.initialSimple(router);
		
		return this.getHandleRequest();
	}
	
	getServer() {
		return this.server;
	}
	
	getApp() {
		return this.app; 
	}
	
	getHandleRequest() {
		return this.getApp().handleRequest.bind(this.getApp());
	}
	
	onError(error){
		if (error.syscall !== 'listen') {
			throw error;
		}
		
		var bind = (typeof this.config.port === 'string') ? 'Pipe ' + port : 'Port ' + this.config.port;

		switch (error.code) {
			case 'EACCES':
				console.error(bind + ' requires elevated privileges');
				process.exit(1);
				break;
			case 'EADDRINUSE':
				console.error(bind + ' is already in use');
				process.exit(1);
				break;
			default:
				console.log("Get error");
				console.log(error);
				throw error;
		}
	}
	
	onListening(){
		const afterServerRunList = Utils.keep("afterServerRun");
		afterServerRunList.map((afterServerRun)=>{
			afterServerRun();
		});
		
		console.log("Listening on port: " + this.config.port);
	}
}

export default ServerCreator;



