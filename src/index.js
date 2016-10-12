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

if((process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "predev") && !isStart){
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