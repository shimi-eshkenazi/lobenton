"use strict";

var watch = require('node-watch');
var path = require('path');
var isListen = false;
var observers = [];

function clearCache(srcDirPath, filename){
	var module = require.cache[filename];

	if (module && module.parent) {
		var parentFileName = module.parent.id.replace(/\\/g,"\/");
		var re = new RegExp(srcDirPath);
		
		if( re.test(parentFileName) ){
			clearCache(srcDirPath, parentFileName);
		}
		
		module.parent.children.splice(module.parent.children.indexOf(module), 1);
	}

	require.cache[filename] = null;
}

function HMR(basePath, callback){
	if(!isListen){
		var srcDirPath = path.join(basePath,'/src');
		isListen = true;
		
		watch(srcDirPath, function(filename){
			clearCache(srcDirPath, filename);
			callback(filename);
			
			observers.map(function(observer){
				observer(filename);
			});
		});
	}
};

HMR.change = function(callback){
	observers.push(callback);
};

module.exports = HMR;