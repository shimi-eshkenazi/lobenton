"use strict";

import http from 'http';
import AppCreator from './AppCreator.js';
import {BaseComponent} from 'lobenton';

class ServerCreator extends BaseComponent {
	constructor() {
		super();
		this.startTime = (new Date()).getTime();
		this.endTime = null;
		this.server = null;
		this.app = null;
	}
	
	initial() {
		this.app = new AppCreator(); 
		
		const argv2 = process.argv[2] || null;
		if(this.config.env === "dev" && argv2 === "--dev"){
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
		
		return this.server;
	}
	
	getServer() {
		return this.server;
	}
	
	getApp() {
		return this.app; 
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
		
		throw error;
	}
	
	onListening(){
		this.endTime = (new Date()).getTime();
		console.log("Listening on port: " + this.config.port);
		console.log("Need Time : " + ((this.endTime-this.startTime)/1000));
		this.startTime = null;
		this.endTime = null;
	}
}

export default ServerCreator;



