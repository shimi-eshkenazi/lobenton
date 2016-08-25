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

function writeFile(path, content) {
	_fs2.default.writeFile(path, content, function (err) {
		if (err) {
			return console.log(err);
		}

		console.log("The react router file was created at " + path + "!");
	});
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
		value: function initial(build) {
			try {
				var controllerList = _FileUtil2.default.getFileList(_path2.default.join(this.config.basePath, "/src/server/controllers/"));

				controllerList.map(function loop(fileName) {
					var filePath = _path2.default.join(this.config.basePath, "/src/server/controllers/" + fileName);
					this.addControllerToMap(filePath, build);
				}.bind(this));

				if (build === true) {
					this.buildRouter();
				}
			} catch (e) {
				console.log(e);
			}
		}
	}, {
		key: "renew",
		value: function renew(filePath) {
			var re = new RegExp(this.config.basePath + "/src", "gi");
			var reController = new RegExp(this.config.basePath + "/src/server/controllers", "gi");

			if (re.test(filePath)) {
				if (reController.test(filePath)) {
					this.addControllerToMap(filePath);
				}

				this.buildRouter();
			}
		}
	}, {
		key: "after",
		value: function after(callback) {
			this.callback = callback;
		}
	}, {
		key: "addControllerToMap",
		value: function addControllerToMap(filePath, build) {
			var fileSource = _FileUtil2.default.getFile(filePath);

			if (build === true && _FileUtil2.default.isControllerHasLayoutAndView(fileSource)) {
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
			var self = this;
			var router = {};

			Object.keys(self.controllerMap).map(function loopFile(filePath) {
				var urlPattern = self.controllerMap[filePath].urlPattern;

				Object.keys(urlPattern).map(function loopPattern(url) {
					var pattern = urlPattern[url];
					var result = self.findMatchRoute(router, url, pattern);

					router = Object.assign(router, result);
				});
			});

			var noHandleUrl = Object.keys(this.allUrl).filter(function loop(url) {
				return this.registedUrl.indexOf(url) === -1 && !this.allUrl[url].hasOwnProperty("ajax");
			}.bind(this)).reduce(function loopNoHandle(newObj, url, index) {
				newObj.push(url + " => " + _Utils2.default.capitalizeFirstLetter(this.allUrl[url].controller) + "Controller");
				return newObj;
			}.bind(this), []);

			if (noHandleUrl.length > 0) {
				throw new Error("Following those routes you set in '" + _lobenton2.default.configPath + "' are no handler:\r\n\t" + noHandleUrl.join("\r\n\t") + "\r\n\r\n");
			}

			var str = _ReactRouterUtil2.default.createRouter(router);
			var filepath = _path2.default.resolve(__dirname, "../../createRouter.js");
			writeFile(filepath, str);

			if (this.callback) {
				this.callback();
			}
		}
	}, {
		key: "findMatchRoute",
		value: function findMatchRoute(router, url, pattern) {
			var hasRoot = false;

			if (this.urlManager.rulesRegex["\\/"]) {
				hasRoot = true;

				if (!router.hasOwnProperty("/")) {
					router["/"] = {};
				}
			}

			Object.keys(this.urlManager.rulesRegex).map(function loopRule(rule) {
				var _this2 = this;

				var ruleValue = this.urlManager.rulesRegex[rule];
				var ruleTarget = ruleValue["controller"] + "/" + ruleValue["action"];

				if (!this.allUrl.hasOwnProperty(ruleTarget)) {
					this.allUrl[ruleTarget] = ruleValue;
				}

				if (ruleTarget === url) {
					(function () {
						if (_this2.registedUrl.indexOf(ruleTarget) === -1) {
							_this2.registedUrl.push(ruleTarget);
						}

						var cpRuleValue = Object.assign({}, ruleValue);

						delete cpRuleValue.controller;
						delete cpRuleValue.action;

						var urlArray = Object.keys(cpRuleValue).reduce(function reduceCp(newObj, param, index) {
							var value = cpRuleValue[param];
							var fixParam = /^d(\d+)$/.test(param) ? param.replace(/^d/, "") : param;

							if (value === "(" + fixParam + ")") {
								newObj.push(fixParam);
							} else {
								newObj.push(":" + fixParam);
							}

							return newObj;
						}, []);

						if (urlArray.length === 1 && !/^\:/.test(urlArray[0])) {
							urlArray.push(urlArray[0]);
						}

						var first = "";

						if (hasRoot === false) {
							first = urlArray.shift();

							if (!router.hasOwnProperty("/" + first)) {
								router["/" + first] = {};
							}
						}

						var newUrl = "/" + urlArray.join("/");

						if (newUrl === "//") {
							newUrl = "/";
						}

						router["/" + first][newUrl] = {
							view: pattern.view,
							viewName: _FileUtil2.default.getViewName(pattern.view),
							docParams: pattern.docParams
						};
					})();
				}
			}.bind(this));

			return router;
		}
	}]);

	return ClientRouterCreator;
}(_lobenton.BaseComponent);

exports.default = ClientRouterCreator;