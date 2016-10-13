"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _async = require("async");

var _async2 = _interopRequireDefault(_async);

var _serveStatic = require("serve-static");

var _serveStatic2 = _interopRequireDefault(_serveStatic);

var _deepAssign = require("deep-assign");

var _deepAssign2 = _interopRequireDefault(_deepAssign);

var _compression = require("compression");

var _compression2 = _interopRequireDefault(_compression);

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cookieParser = require("cookie-parser");

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _getParameterNames = require("get-parameter-names");

var _getParameterNames2 = _interopRequireDefault(_getParameterNames);

var _lobenton = require("lobenton");

var _lobenton2 = _interopRequireDefault(_lobenton);

var _ErrorException = require("../exceptions/ErrorException.js");

var _ErrorException2 = _interopRequireDefault(_ErrorException);

var _NotFoundException = require("../exceptions/NotFoundException.js");

var _NotFoundException2 = _interopRequireDefault(_NotFoundException);

var _Utils = require("../utils/Utils.js");

var _Utils2 = _interopRequireDefault(_Utils);

var _FileUtil = require("../utils/FileUtil.js");

var _FileUtil2 = _interopRequireDefault(_FileUtil);

var _RequireByFormat = require("../utils/RequireByFormat.js");

var _RequireByFormat2 = _interopRequireDefault(_RequireByFormat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var compiler = null;
var devMiddleware = null;
var hotMiddleware = null;
var Webpack = null;
var WebpackDevMiddleware = null;
var WebpackHotMiddleware = null;

function createCompiler(webpackDevConfig) {
	if (!Webpack) {
		Webpack = require("webpack");
		Webpack = Webpack.default || Webpack;
	}

	compiler = Webpack(webpackDevConfig);
}

function createDevMiddleware(webpackDevConfig) {
	if (!WebpackDevMiddleware) {
		WebpackDevMiddleware = require("webpack-dev-middleware");
		WebpackDevMiddleware = WebpackDevMiddleware.default || WebpackDevMiddleware;
	}

	devMiddleware = WebpackDevMiddleware(compiler, {
		noInfo: true,
		publicPath: webpackDevConfig.output.publicPath,
		stats: {
			colors: true
		}
	});
}

function createHotMiddleware(webpackDevConfig) {
	if (!WebpackHotMiddleware) {
		WebpackHotMiddleware = require("webpack-hot-middleware");
		WebpackHotMiddleware = WebpackHotMiddleware.default || WebpackHotMiddleware;
	}

	hotMiddleware = WebpackHotMiddleware(compiler);
}

var RequestHandler = function () {
	function RequestHandler(config, reactRouter) {
		_classCallCheck(this, RequestHandler);

		this.controllerPath = null;
		this.reactRouter = reactRouter || null;
		this.config = config;
		this.request = null;
		this.response = null;
		this.staticFolder = this.config.staticFolder ? _path2.default.join(this.config.basePath, this.config.staticFolder) : _path2.default.join(this.config.basePath, "public");
		this.processChain = [(0, _compression2.default)(), (0, _serveStatic2.default)(this.staticFolder), _Utils2.default.fixQuery(), (0, _cookieParser2.default)(), _bodyParser2.default.json(), _bodyParser2.default.urlencoded({ extended: true })];

		if (process.env.NODE_ENV === "dev" && !this.config.isStart && this.config.webpackDevConfig) {
			var webpackDevConfigMain = require(this.config.webpackDevConfig);
			webpackDevConfigMain = webpackDevConfigMain.default || webpackDevConfigMain;

			var webpackDevConfig = webpackDevConfigMain(this.config);

			if (this.config.hasOwnProperty("webpackDevConfig")) {
				if (!compiler) {
					createCompiler(webpackDevConfig);
				}

				if (!devMiddleware) {
					createDevMiddleware(webpackDevConfig);
				}

				if (!hotMiddleware) {
					createHotMiddleware(webpackDevConfig);
				}

				this.processChain.push(devMiddleware, hotMiddleware);
			}
		}

		this.addMiddleWare();
	}

	_createClass(RequestHandler, [{
		key: "addMiddleWare",
		value: function addMiddleWare() {
			if (this.config.hasOwnProperty("middlewares")) {
				Object.keys(this.config.middlewares).map(function loopMD(middlewareName) {
					var mdSetting = this.config.middlewares[middlewareName];
					var mdInstance = (0, _RequireByFormat2.default)(mdSetting.path);

					mdInstance = mdInstance.default || mdInstance;

					if (mdSetting.exec === true) {
						mdInstance = mdInstance(this.config, mdSetting);
					}

					var func = function func(req, res, next) {
						return mdInstance(req, res, next);
					};

					Object.defineProperty(func, 'name', { value: middlewareName, configurable: true });
					this.processChain.push(func);
				}.bind(this));
			}
		}
	}, {
		key: "runPrecessChain",
		value: function runPrecessChain(callback) {
			_async2.default.eachSeries(this.processChain, function middleware(mw, cb) {
				mw(this.request, this.response, cb);
			}.bind(this), callback);
		}
	}, {
		key: "setRequest",
		value: function setRequest(request) {
			this.request = request;
		}
	}, {
		key: "setResponse",
		value: function setResponse(response) {
			this.response = response;
		}
	}, {
		key: "loadController",
		value: function loadController(matchResult) {
			try {
				var controller = null;
				var srcIndex = 0;
				var hasResult = false;
				var loop = true;
				var middleSrc = "";

				matchResult.controller = _Utils2.default.capitalizeFirstLetter(matchResult.controller) + "Controller";
				matchResult.action = "action" + _Utils2.default.capitalizeFirstLetter(matchResult.action);

				while (loop) {
					try {
						middleSrc = matchResult.controllerPath[srcIndex];

						if (/\./.test(middleSrc)) {
							this.controllerPath = _FileUtil2.default.findControllerPath(this.config.basePath, middleSrc);
							this.controllerPath = _path2.default.join(this.controllerPath, matchResult.controller);
							controller = (0, _RequireByFormat2.default)(middleSrc);
							controller = controller[matchResult.controller];
						} else {
							middleSrc = "/" + middleSrc + "/";
							this.controllerPath = _path2.default.join(this.config.basePath, middleSrc + matchResult.controller);
							controller = require(this.controllerPath);
						}

						if (controller) {
							hasResult = true;
							loop = false;
						}
					} catch (e) {
						srcIndex++;

						if (srcIndex === matchResult.controllerPath.length) {
							loop = false;
						}
					}
				}

				if (hasResult === false) {
					throw new _NotFoundException2.default("Cannot find controller '" + matchResult.controller + "'");
				}

				controller = controller.default || controller;

				return controller;
			} catch (e) {
				throw e;
			}
		}
	}, {
		key: "doController",
		value: function doController(matchResult, controller) {
			try {
				var controllerInstance = null;
				var reqHeaders = this.request.headers || {};
				var reqCookies = this.request.cookies || {};

				controllerInstance = new controller();
				controllerInstance.setController(matchResult.controller);
				controllerInstance.setConfig(this.config);
				controllerInstance.setReactRouter(this.reactRouter);
				controllerInstance.setRequest(this.request);
				controllerInstance.setResponse(this.response);
				controllerInstance.setNowHttpMethod(this.request.method.toUpperCase());
				controllerInstance.setHeaderMap(reqHeaders);
				controllerInstance.setCookieMap(reqCookies);
				controllerInstance.initial(true);

				return controllerInstance;
			} catch (e) {
				throw e;
			}
		}
	}, {
		key: "loadAction",
		value: function loadAction(matchResult, controller, controllerInstance) {
			var _this = this;

			try {
				var _ret = function () {
					var action = controllerInstance[matchResult.action];

					if (controller.hasOwnProperty(matchResult.action)) {
						if (controller.hasOwnProperty("layout")) {
							controllerInstance.layout = controller.layout;
						}

						controller[matchResult.action] = _FileUtil2.default.fixDefProperties(controller[matchResult.action]);

						Object.keys(controller[matchResult.action]).map(function (key, index) {
							action[key] = controller[matchResult.action][key];
						});
					} else {
						throw new _NotFoundException2.default("Annotation To Props Error : Cannot find action '" + matchResult.action + "' at '" + matchResult.controller + "'; Url : " + _this.request.url);
					}

					if (typeof action.method === 'string' && action.method.toUpperCase() !== _this.request.method.toUpperCase()) {
						throw new _NotFoundException2.default("Http method Error : Cannot find action '" + matchResult.action + "' at '" + matchResult.controller + "'; Url : " + _this.request.url);
					} else if (_typeof(action.method) === 'object') {
						if (action.method.indexOf(_this.request.method.toUpperCase()) === -1) {
							throw new _NotFoundException2.default("Http method Error : Cannot find action '" + matchResult.action + "' at '" + matchResult.controller + "'; Url : " + _this.request.url);
						}
					}

					return {
						v: action
					};
				}();

				if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
			} catch (e) {
				throw e;
			}
		}
	}, {
		key: "doAction",
		value: function doAction(matchResult, controllerInstance, action, paramObj) {
			try {
				if (action.hasOwnProperty("login")) {
					Object.keys(action).map(function loopDocProp(prop) {
						controllerInstance.set(prop, action[prop]);
					});

					controllerInstance.afterContinue(function checkLogin(result) {
						try {
							controllerInstance.setAction(matchResult.action);
							controllerInstance.setFilterResult(result);
							controllerInstance.setParamMap(paramObj.paramMap);
							controllerInstance.beforeAction.apply(controllerInstance, paramObj.actionArgs);
							action.apply(controllerInstance, paramObj.actionArgs);
							controllerInstance.afterAction.apply(controllerInstance, paramObj.actionArgs);
						} catch (e1) {
							return this.execError({}, e1);
						}
					}.bind(this));

					var LoginFilter = _lobenton2.default.getComponent("loginFilter");
					LoginFilter.do(controllerInstance);
				} else {
					controllerInstance.setAction(matchResult.action);
					controllerInstance.setParamMap(paramObj.paramMap);
					controllerInstance.beforeAction.apply(controllerInstance, paramObj.actionArgs);
					action.apply(controllerInstance, paramObj.actionArgs);
					controllerInstance.afterAction.apply(controllerInstance, paramObj.actionArgs);
				}
			} catch (e) {
				throw e;
			}
		}
	}, {
		key: "fixArgs",
		value: function fixArgs(action) {
			var _this2 = this;

			try {
				var _ret2 = function () {
					var reqParams = _this2.request.params || {};
					var reqBody = _this2.request.body || {};
					var reqQuery = _this2.request.query || {};
					var reqErrorObject = _this2.request.errorObject || null;

					var actionArgs = [];
					var args = (0, _getParameterNames2.default)(action);
					var argsMerge = (0, _deepAssign2.default)(reqParams, reqQuery, reqBody);

					if (reqErrorObject !== null) {
						argsMerge["errorObject"] = reqErrorObject;
					}

					var paramMap = args.reduce(function (newObj, value, index) {
						var paramName = value;

						if (argsMerge.hasOwnProperty(paramName)) {
							actionArgs.push(argsMerge[paramName]);
							newObj[paramName] = argsMerge[paramName];
						} else {
							actionArgs.push(null);
							newObj[paramName] = null;
						}

						delete argsMerge[paramName];

						return newObj;
					}, {});

					paramMap = (0, _deepAssign2.default)(paramMap, argsMerge);

					return {
						v: { paramMap: paramMap, actionArgs: actionArgs }
					};
				}();

				if ((typeof _ret2 === "undefined" ? "undefined" : _typeof(_ret2)) === "object") return _ret2.v;
			} catch (e) {
				throw e;
			}
		}
	}, {
		key: "noSomethingMatch",
		value: function noSomethingMatch() {
			var pathname = _Utils2.default.fixUrl(this.request).pathname;

			if (/.+\..+$/.test(pathname)) {
				throw new _NotFoundException2.default("File match error : Cannot find file '" + pathname + "'");
			} else {
				throw new _NotFoundException2.default("Route match error : Cannot find route '" + pathname + "'");
			}
		}
	}, {
		key: "testMatch",
		value: function testMatch() {
			var matchResult = null;
			var pathname = null;
			var UrlManager = _lobenton2.default.getComponent("urlManager");

			if (this.request.hasOwnProperty("alreadyMatch")) {
				matchResult = Object.assign({}, this.request.alreadyMatch);
				matchResult.paramMap = {};
				matchResult.controllerPath = UrlManager.getConfig().controllerPath;
			} else {
				pathname = _Utils2.default.fixUrl(this.request).pathname;
				matchResult = UrlManager.do(pathname);

				if (matchResult === "no impl!") {
					throw new Error("No impl 'do' for system call in UrlManager");
				}
			}

			delete matchResult.paramMap.controller;
			delete matchResult.paramMap.action;

			return matchResult;
		}
	}, {
		key: "finalError",
		value: function finalError(error) {
			this.response.statusCode = error.code || 500;
			this.response.setHeader('Content-Type', 'text/html');
			this.response.end("<pre>" + error.stack + "</pre>");
		}
	}, {
		key: "execError",
		value: function execError(data, error) {
			if (this.config.hasOwnProperty("defaultErrorController") && this.config.defaultErrorController !== "") {
				var controllerAction = this.config.defaultErrorController;
				var controllerActionArray = controllerAction.split("/");

				if (this.request.hasOwnProperty("alreadyMatch") && this.request.alreadyMatch.controller === controllerActionArray[0]) {
					this.finalError(error);
				} else {
					this.request.method = "GET";
					var _controllerAction = this.config.defaultErrorController;
					var _controllerActionArray = _controllerAction.split("/");

					if (_controllerActionArray.length === 2) {
						this.request.alreadyMatch = {
							controller: _controllerActionArray[0],
							action: _controllerActionArray[1]
						};
						data = data || {};
						data.code = error.code || 500;
						data.error_code = error.code || 500;
						data.message = error.message || "Server Error";
						data.error_message = error.message || "Server Error";
						_lobenton2.default.getApp().forwardBridge(this.request.url, data, this.request, this.response, error);
					} else {
						this.finalError(new _ErrorException2.default("Forward error : Cannot find pattern '" + _controllerAction + "'"));
					}
				}
			} else {
				this.finalError(error);
			}
		}
	}, {
		key: "exec",
		value: function exec(data, errorObject) {
			try {
				this.runPrecessChain(function processChainResult(errorMag) {
					try {
						if (errorMag) {
							throw new _ErrorException2.default(errorMag);
						}

						var matchResult = this.testMatch();

						this.request.params = matchResult.paramMap;
						this.request.errorObject = errorObject ? errorObject : null;

						if ((typeof data === "undefined" ? "undefined" : _typeof(data)) === "object" && Object.keys(data).length > 0) {
							this.request.query = data;
							this.request.body = {};
						}

						if (matchResult.controller !== null) {
							var controller = this.loadController(matchResult);
							var controllerInstance = this.doController(matchResult, controller);
							var action = this.loadAction(matchResult, controller, controllerInstance);
							var paramObj = this.fixArgs(action);
							this.doAction(matchResult, controllerInstance, action, paramObj);
						} else {
							this.noSomethingMatch();
						}
					} catch (e) {
						this.execError(data, e);
					}
				}.bind(this));
			} catch (error) {
				this.execError(data, error);
			}
		}
	}]);

	return RequestHandler;
}();

exports.default = RequestHandler;