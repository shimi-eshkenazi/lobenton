"use strict";

var FileUtil = require("../utils/FileUtil.js").default;
var watch = require('node-watch');
var path = require('path');
var isListen = false;
var observers = [];

function clearCache(srcDirPath, filename) {
	if (/lobenton\.js/.test(filename)) {
		return;
	}

	var module = require.cache[filename];

	if (module && module.parent) {
		var parentFileName = module.parent.id;
		clearCache(srcDirPath, parentFileName);

		module.parent.children.splice(module.parent.children.indexOf(module), 1);
	}

	require.cache[filename] = null;
}

function processForFileChange(libDirPath, nodeDirPath, filename) {
	var targetFilePath = "";

	if (FileUtil.isWindows()) {
		filename += !/\.js(|x)$/gi.test(filename) ? "\\index.js" : "";
		targetFilePath = filename.replace(/\\/g, "/");
	} else {
		filename += !/\.js(|x)$/gi.test(filename) ? "/index.js" : "";
		targetFilePath = filename;
	}

	targetFilePath = targetFilePath.replace(/\/src\//, "/lib/");
	var result = FileUtil.compilerFile(filename);
	var err = FileUtil.writeFile(targetFilePath, result);

	clearCache(libDirPath, targetFilePath);
	clearCache(nodeDirPath, path.resolve(__dirname, "../../client.js"));
}

function processForFileCP(libDirPath, filename) {
	var targetFilePath = "";

	if (FileUtil.isWindows()) {
		targetFilePath = filename.replace(/\\/g, "/");
	} else {
		targetFilePath = filename;
	}

	targetFilePath = targetFilePath.replace(/\/src\//, "/lib/");
	var result = FileUtil.getFile(filename, false);
	var err = FileUtil.writeFile(targetFilePath, { code: result });

	clearCache(libDirPath, targetFilePath);
}

function HMR(basePath, callback) {
	if (!isListen) {
		var srcDirPath = path.join(basePath, '/src');
		var libDirPath = path.join(basePath, '/lib');
		var nodeDirPath = path.join(basePath, '/node_modules');
		isListen = true;

		watch(srcDirPath, function (filename) {
			var targetFilePath = "";

			try {
				if (FileUtil.isFile(filename)) {
					if (FileUtil.isJsFile(filename)) {
						processForFileChange(libDirPath, nodeDirPath, filename);
					} else {
						processForFileCP(libDirPath, filename);
					}
				} else {
					processForFileChange(libDirPath, nodeDirPath, filename);
				}

				callback(filename);

				observers.map(function (observer) {
					observer(filename);
				});
			} catch (e) {
				console.log(e);
			}
		});
	}
};

HMR.change = function change(callback) {
	observers.push(callback);
};

HMR.clean = function clean(regex) {
	Object.keys(require.cache).map(function (filename) {
		if (regex.test(filename)) {
			require.cache[filename] = null;
		}
	});
};

module.exports = HMR;