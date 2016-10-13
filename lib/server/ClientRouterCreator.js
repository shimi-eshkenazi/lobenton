"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _FileUtil = require("../utils/FileUtil.js");

var _FileUtil2 = _interopRequireDefault(_FileUtil);

var _Utils = require("../utils/Utils.js");

var _Utils2 = _interopRequireDefault(_Utils);

var _ReactRouterUtil = require("../utils/ReactRouterUtil.js");

var _ReactRouterUtil2 = _interopRequireDefault(_ReactRouterUtil);

var _lobenton = require("lobenton");

var _lobenton2 = _interopRequireDefault(_lobenton);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function writeFile(path, content, callback) {
	var result = _FileUtil2.default.compiler(content);
	var err = _FileUtil2.default.writeFile(path, result);

	if (err) {
		console.log(err);
		callback(err);
		return;
	}

	console.log("The react router file was created at " + path + "!");
	callback();
	return;
}

var ClientRouterCreator = function (_BaseComponent) {
	_inherits(ClientRouterCreator, _BaseComponent);

	function ClientRouterCreator() {
		_classCallCheck(this, ClientRouterCreator);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ClientRouterCreator).call(this));

		_this.callback = null;
		_this.allUrl = {};
		_this.registedUrl = [];
		_this.urlManager = null;
		_this.controllerMap = {};
		return _this;
	}

	_createClass(ClientRouterCreator, [{
		key: "setUrlManager",
		value: function setUrlManager(urlManager) {
			this.urlManager = urlManager;
		}
	}, {
		key: "initial",
		value: function initial() {
			try {
				this.urlManager.config.controllerPath.map(function loopPath(controllerPath, index) {
					var sourcePath = null;

					if (/\./.test(controllerPath)) {
						sourcePath = _FileUtil2.default.findControllerPath(this.config.basePath, controllerPath);
					} else {
						//for parser, so we need to use source
						controllerPath = controllerPath.replace(/^lib\//, "src/");
						sourcePath = _path2.default.join(this.config.basePath, controllerPath);
					}

					if (/node_modules/.test(sourcePath)) {
						return;
					}

					var controllerList = _FileUtil2.default.getFileList(sourcePath);

					controllerList.map(function loop(fileName) {
						var filePath = _path2.default.join(sourcePath, fileName);
						this.addControllerToMap(filePath);
					}.bind(this));
				}.bind(this));

				this.buildRouter();
			} catch (e) {
				console.log(e);
			}
		}
	}, {
		key: "renew",
		value: function renew(filePath) {
			try {
				this.allUrl = {};
				this.registedUrl = [];

				// HMR watching src, so we got src file path when change
				var re = _path2.default.join(this.config.basePath, "/src");
				var reController = _path2.default.join(this.config.basePath, "/src/server/controllers");

				if (_path2.default.sep === "\\") {
					re = re.replace(/\\/g, "\\\\");
					reController = reController.replace(/\\/g, "\\\\");
				}

				re = new RegExp(re, "gi");
				reController = new RegExp(reController, "gi");

				if (re.test(filePath)) {
					if (reController.test(filePath)) {
						this.addControllerToMap(filePath);
					}

					this.buildRouter();
				}
			} catch (e) {
				console.log(e);
			}
		}
	}, {
		key: "after",
		value: function after(callback) {
			this.callback = callback;
		}
	}, {
		key: "addControllerToMap",
		value: function addControllerToMap(filePath) {
			var fileSource = _FileUtil2.default.getFile(filePath);

			if (_FileUtil2.default.isControllerHasLayoutAndView(fileSource)) {
				if (_FileUtil2.default.isSourceHasLoginTrue(fileSource)) {
					try {
						_lobenton2.default.getComponent("loginFilter");
					} catch (e) {
						throw e;
					}
				}

				var urlPattern = _FileUtil2.default.getUrlPatternFromController(fileSource);

				this.controllerMap[filePath] = {
					source: fileSource,
					urlPattern: urlPattern
				};
			}
		}
	}, {
		key: "buildRouter",
		value: function buildRouter() {
			var _this2 = this;

			var self = this;
			var router = { subRules: {} };

			this.findMatchRoute(router, this.urlManager.config.rules);

			var noHandleUrl = Object.keys(this.allUrl).filter(function loop(url) {
				return this.allUrl[url] !== null && this.registedUrl.indexOf(url) === -1;
			}.bind(this)).reduce(function loopNoHandle(newObj, url, index) {
				newObj.push(url + " => " + _Utils2.default.capitalizeFirstLetter(this.allUrl[url].controller) + "Controller");
				return newObj;
			}.bind(this), []);

			if (noHandleUrl.length > 0) {
				console.log("Following those routes you set in '" + _lobenton2.default.configPath + "' are no handler:\r\n\t" + noHandleUrl.join("\r\n\t") + "\r\n\r\n");
			}

			var str = _ReactRouterUtil2.default.createRouter(router);
			var createRouterFilepath = _path2.default.resolve(__dirname, "../../createRouter.js");

			if (this.config.hasOwnProperty("routerFolder") && this.config.routerFolder !== "") {
				createRouterFilepath = _path2.default.join(this.config.basePath, this.config.routerFolder, "createRouter.js");
			}

			writeFile(createRouterFilepath, str, function (err) {
				if (err) {
					throw err;
				}
				if (_this2.callback) {
					_this2.callback();
				}
			});
		}
	}, {
		key: "findMatchRoute",
		value: function findMatchRoute(router, currentMap) {
			Object.keys(currentMap).map(function loop(pattern) {
				// 去除regex
				var patternValue = currentMap[pattern];
				pattern = /^\//.test(pattern) ? pattern : "/" + pattern;

				var result = null;
				var regexArray = [];
				var regexStr = '';
				var re = new RegExp("\\/(((?!\\/).)*)", "gi");

				while (result = re.exec(pattern)) {
					var partResult = result[1];
					partResult = partResult.replace(/\(.+/g, '');
					regexArray.push(partResult);
				}

				// 轉成字串
				regexStr = "/" + regexArray.join("/");

				var extend = false;

				if (Array.isArray(patternValue)) {
					if (patternValue.length > 1 && patternValue[1] === true) {
						extend = true;
					}

					patternValue = patternValue[0];
				}

				// 如果值是字串
				if (typeof patternValue === 'string') {
					if (!this.allUrl.hasOwnProperty(patternValue)) {
						this.allUrl[patternValue] = null;
					}

					// 所有 controller 檔案
					Object.keys(this.controllerMap).map(function loopFile(filePath) {
						var urlPattern = this.controllerMap[filePath].urlPattern;

						// controller 檔案內的組合
						Object.keys(urlPattern).map(function loopPattern(controllerAction) {
							var controllerActionValue = urlPattern[controllerAction];

							// 註冊在全部
							if (this.allUrl.hasOwnProperty(controllerAction)) {
								this.allUrl[controllerAction] = controllerActionValue;
							}

							// 命中
							if (controllerAction === patternValue) {
								// 註冊在已匹配
								if (this.registedUrl.indexOf(patternValue) === -1) {
									this.registedUrl.push(patternValue);
								} else {}
								//return;


								// 如果是根目錄
								if (extend === true) {
									router.pattern = {
										view: controllerActionValue.view,
										viewName: _FileUtil2.default.getViewName(controllerActionValue.view),
										docParams: controllerActionValue.docParams
									};
								} else {
									// 加入子目錄
									router.subRules[regexStr] = {
										pattern: {
											view: controllerActionValue.view,
											viewName: _FileUtil2.default.getViewName(controllerActionValue.view),
											docParams: controllerActionValue.docParams
										},
										subRules: null
									};
								}
							}
						}.bind(this));
					}.bind(this));
				} else {
					// 新開一個物件
					router.subRules[regexStr] = {
						pattern: "",
						subRules: {}
					};
					this.findMatchRoute(router.subRules[regexStr], patternValue);
				}
			}.bind(this));
		}
	}]);

	return ClientRouterCreator;
}(_lobenton.BaseComponent);

exports.default = ClientRouterCreator;