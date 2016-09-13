"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _Utils = require("./Utils.js");

var _Utils2 = _interopRequireDefault(_Utils);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _babelCore = require("babel-core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getControllerName(source) {
	var docExec = new RegExp("class(\\w+)Controllerextends", "gi").exec(source);
	return _Utils2.default.lowerFirstLetter(docExec[1]) || null;
}

function getActionName(source) {
	var docExec = new RegExp("\\*action(\\w+)\\*", "gi").exec(source);
	return _Utils2.default.lowerFirstLetter(docExec[1]) || null;
}

function getActionFuctionName(source) {
	var docExec = new RegExp("\\*action(\\w+)\\*", "gi").exec(source);
	return docExec[1] ? "action" + docExec[1] : null;
}

function getControllerLayout(source) {
	var docExec = new RegExp("this\.layout\=(\"|\')(((?!\\*).)*)(\"|\')", "gi").exec(source);
	return docExec[2] || null;
}

function getActionView(source) {
	var docExec = new RegExp("\\@view\\:(((?!\\*).)*)\\*", "gi").exec(source);
	return docExec[1] || null;
}

function isSourceHasLayout(source) {
	return (/this\.layout/g.test(source)
	);
}

function isSourceHasView(source) {
	return (/\@view/g.test(source)
	);
}

var FileUtil = function () {
	function FileUtil() {
		_classCallCheck(this, FileUtil);
	}

	_createClass(FileUtil, null, [{
		key: "compiler",
		value: function compiler(content) {
			return (0, _babelCore.transform)(content, babelrc);
		}
	}, {
		key: "compilerFile",
		value: function compilerFile(src) {
			return (0, _babelCore.transformFileSync)(src, babelrc);
		}
	}, {
		key: "writeFile",
		value: function writeFile(src, result) {
			return _fs2.default.writeFileSync(src, result.code);
		}
	}, {
		key: "getFile",
		value: function getFile(src) {
			var buffer = _fs2.default.readFileSync(src, "utf8");
			buffer = buffer.replace(/\s/g, "");
			return buffer;
		}
	}, {
		key: "getFileList",
		value: function getFileList(src) {
			try {
				return _fs2.default.readdirSync(src, "utf8");
			} catch (e) {
				throw e;
			}
		}
	}, {
		key: "getParamFromDoc",
		value: function getParamFromDoc(mtd, source) {
			var target = {};
			var docExec = new RegExp("\\/\\*\\*.+" + mtd + "\\*(.+)\\*\\/" + mtd + "(\\s+|)\\(", "gi").exec(source);

			if (docExec !== null) {
				var docArray = typeof docExec[1] !== "undefined" ? docExec[1].split("*") : [];

				docArray.map(function loopDoc(doc) {
					if (/\:/.test(doc)) {
						var docToPatam = doc.split(":");
						var key = docToPatam[0].replace("@", "");

						if ([true, "true", false, "false"].indexOf(docToPatam[1]) !== -1) {
							if ([true, "true"].indexOf(docToPatam[1]) !== -1) {
								docToPatam[1] = true;
							} else {
								docToPatam[1] = false;
							}
						} else if (/^\d+$/g.test(docToPatam[1])) {
							docToPatam[1] /= 1;
						}

						switch (key) {
							case 'login':
								target[key] = docToPatam[1] || false;
								break;
							case 'method':
								var value = docToPatam[1];

								if (/\,/.test(value)) {
									value = value.split(",");
									value = value.map(function (v) {
										return v.toUpperCase();
									});
								}

								target[key] = value || "GET";
								break;
							default:
								target[key] = docToPatam[1] || null;
								break;
						}
					}
				});
			}

			target["login"] = target["login"] || false;
			target["method"] = target["method"] || "GET";

			return target;
		}
	}, {
		key: "fixControllerMethod",
		value: function fixControllerMethod(target, source) {
			if (!source) {
				source = FileUtil.getFile(target.controllerPath + ".js");
			}

			_Utils2.default.getAllMethods(target.constructor.prototype).forEach(function forEachPrototype(mtd) {
				if (mtd !== "constructor") {
					(function () {
						var docParams = FileUtil.getParamFromDoc(mtd, source);

						Object.keys(docParams).map(function loopDocParams(param) {
							target[mtd][param] = docParams[param];
						});
					})();
				}
			});
		}
	}, {
		key: "isControllerHasLayoutAndView",
		value: function isControllerHasLayoutAndView(source) {
			return isSourceHasLayout(source) && isSourceHasView(source);
		}
	}, {
		key: "getViewName",
		value: function getViewName(source) {
			var docSplit = source.split("/");
			var lastTwo = docSplit.slice(-2);
			return _Utils2.default.capitalizeFirstLetter(lastTwo[0]) + _Utils2.default.capitalizeFirstLetter(lastTwo[1]);
		}
	}, {
		key: "isSourceHasLoginTrue",
		value: function isSourceHasLoginTrue(source) {
			return (/\@login\:true/g.test(source)
			);
		}
	}, {
		key: "getUrlPatternFromController",
		value: function getUrlPatternFromController(source) {
			var docExec = null;
			var urlMap = {};
			var controllerName = getControllerName(source);
			var controllerLayout = getControllerLayout(source);
			var re = new RegExp("\\/\\*\\*((?!\\*\\/).)*\\*\\/", "gi");

			while (docExec = re.exec(source)) {
				if (isSourceHasView(docExec[0])) {
					var actionName = getActionName(docExec[0]);
					var actionFuctionName = getActionFuctionName(docExec[0]);
					var actionView = getActionView(docExec[0]);
					var url = controllerName + "/" + actionName;
					var docParams = FileUtil.getParamFromDoc(actionFuctionName, source);

					delete docParams.view;

					urlMap[url] = {
						controller: controllerName,
						action: actionName,
						layout: controllerLayout,
						view: actionView,
						docParams: docParams
					};
				}
			}

			return urlMap;
		}
	}, {
		key: "findControllerPath",
		value: function findControllerPath(basePath, expression) {
			var expressionArray = expression.split(".");
			var sourcePath = _path2.default.join(basePath, "./node_modules");
			sourcePath = _path2.default.resolve(sourcePath, "./" + expressionArray[0].replace(/\/.+/g, ""));
			sourcePath = _path2.default.resolve(sourcePath, "./src/server");

			expressionArray.map(function (node, index) {
				if (index !== 0) {
					sourcePath = _path2.default.resolve(sourcePath, node);
				}
			});

			return sourcePath;
		}
	}]);

	return FileUtil;
}();

var babelrc = FileUtil.getFile(".babelrc");
babelrc = JSON.parse(babelrc);

exports.default = FileUtil;