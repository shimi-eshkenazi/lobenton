Error.stackTraceLimit = 50;

var path = require("path");
var dirPath = path.resolve(__dirname, path.relative(__dirname, ''));
var rootDir = '';
if(path.sep === "/"){
	rootDir = dirPath.replace(/(.+|)\//g,'');
}else{
	rootDir = dirPath.replace(new RegExp(".+\\"+path.sep),'');
}

if(process.env.NODE_ENV === "dev"){
	var re = new RegExp("lobenton|"+rootDir+"\/src");
	require('babel-core/register')({
		ignore: function(filename){
			if(re.test(filename)){
				return false;
			}else{
				return true;
			}
		}
	});
}

process.env.NODE_PATH += ":"+dirPath;
require('module').Module._initPaths();
require("babel-helper-error-stack");
module.exports = require("./lobenton");