var pathModule = require('path');
var assert = require('assert').ok;

module.constructor.prototype.require = function require(path) {
	var self = this;
	assert(typeof path === 'string', 'path must be a string');
	assert(path, 'missing path');

	try {
		return self.constructor._load(path, self);
	} catch (err) {
		if(global.hasOwnProperty(path)){
			return global[path];
		}else{
			throw err;
		}
	}
};

Error.stackTraceLimit = 50;
process.env.BABEL_DISABLE_CACHE=1;

var path = require("path");
var dirPath = path.resolve(__dirname, path.relative(__dirname, ''));
var rootDir = '';
var isStart = JSON.parse(process.env.npm_config_argv).original.slice(-1).pop() === "start";

if(path.sep === "/"){
	rootDir = dirPath.replace(/(.+|)\//g,'');
}else{
	rootDir = dirPath.replace(new RegExp(".+\\"+path.sep),'');
}

if((process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "predev" || process.env.NODE_ENV === "test") && !isStart){
	require('babel-core/register')
}

if(process.env.NODE_PATH){
	process.env.NODE_PATH += ":"+dirPath;
}else{
	process.env.NODE_PATH = dirPath;
}

require('module').Module._initPaths();
require("babel-helper-error-stack");

module.exports = require("./lobenton");