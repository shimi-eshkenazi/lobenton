"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _RequestHandler = require("./RequestHandler.js");

var _RequestHandler2 = _interopRequireDefault(_RequestHandler);

var _ConponentCreator = require("./ConponentCreator");

var _ConponentCreator2 = _interopRequireDefault(_ConponentCreator);

var _lobenton = require("lobenton");

var _ClientRouterCreator = require("./ClientRouterCreator.js");

var _ClientRouterCreator2 = _interopRequireDefault(_ClientRouterCreator);

var _Utils = require("../utils/Utils.js");

var _Utils2 = _interopRequireDefault(_Utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AppCreator = function (_BaseComponent) {
	_inherits(AppCreator, _BaseComponent);

	function AppCreator() {
		_classCallCheck(this, AppCreator);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AppCreator).call(this));

		_this.reactRouter = null;
		_this.components = {};
		_this.clientRouterCreator = null;
		return _this;
	}

	_createClass(AppCreator, [{
		key: "initial",
		value: function initial() {
			this.createComponents(true);

			var createRouterFilepath = _path2.default.resolve(__dirname, "../../createRouter.js");

			if (this.config.hasOwnProperty("routerFolder") && this.config.routerFolder !== "") {
				createRouterFilepath = _path2.default.join(this.config.basePath, this.config.routerFolder, "createRouter.js");
			}

			if (process.env.NODE_ENV === "dev" && !this.config.isStart) {
				// 有 webpack config 才做事 
				if (this.config.webpackDevConfig) {
					this.clientRouterCreator = new _ClientRouterCreator2.default();
					this.clientRouterCreator.setUrlManager(this.components["UrlManager"]);
					this.clientRouterCreator.setConfig(this.config);
				}

				var HMR = require("./HMR.js");
				HMR = HMR.default || HMR;
				HMR.change(function change(filePath) {
					if (/createRouter\.js/.test(filePath)) {
						return;
					}

					this.components = { "Log": this.components["Log"] };
					this.createComponents(false);

					if (this.config.webpackDevConfig) {
						this.clientRouterCreator.setUrlManager(this.components["UrlManager"]);
						this.clientRouterCreator.setConfig(this.config);
						this.clientRouterCreator.renew(filePath);
					}
				}.bind(this));

				if (this.config.webpackDevConfig) {
					this.clientRouterCreator.after(function after() {
						this.reactRouter = require(createRouterFilepath).default;
						new _RequestHandler2.default(this.config, this.reactRouter);
					}.bind(this));
					this.clientRouterCreator.initial();
				} else {
					new _RequestHandler2.default(this.config);
				}
			} else {
				if (this.config.webpackDevConfig) {
					this.reactRouter = require(createRouterFilepath).default;
				}

				new _RequestHandler2.default(this.config, this.reactRouter);
			}
		}
	}, {
		key: "initialSimple",
		value: function initialSimple() {
			this.createComponents(true);
			this.clientRouterCreator = new _ClientRouterCreator2.default();
			this.clientRouterCreator.setUrlManager(this.components["UrlManager"]);
			this.clientRouterCreator.setConfig(this.config);
			this.clientRouterCreator.initial();
		}
	}, {
		key: "createComponents",
		value: function createComponents(noLog) {
			if (this.config.components) {
				for (var componentName in this.config.components) {
					if (componentName !== 'log' || componentName === 'log' && noLog === true) {
						var componentSetting = this.config.components[componentName];
						componentSetting.basePath = this.config.basePath;
						componentSetting.urlPrefixPath = this.config.urlPrefixPath;
						this.components[_Utils2.default.capitalizeFirstLetter(componentName)] = this.createComponent(componentName, componentSetting);
					}
				}
			}
		}
	}, {
		key: "createComponent",
		value: function createComponent(componentName, componentSetting) {
			var conponentCreator = new _ConponentCreator2.default(componentName);
			conponentCreator.setConfig(componentSetting);
			return conponentCreator.initial();
		}
	}, {
		key: "getComponent",
		value: function getComponent(componentName) {
			componentName = _Utils2.default.capitalizeFirstLetter(componentName);

			if (this.components.hasOwnProperty(componentName) && this.components[componentName] !== null) {
				return this.components[componentName];
			}

			throw new Error("Component " + componentName + " is not defined in your config.components");
		}
	}, {
		key: "getConfig",
		value: function getConfig() {
			return this.config;
		}
	}, {
		key: "forwardBridge",
		value: function forwardBridge(path, data, request, response, errorObject) {
			var oldPathname = _Utils2.default.fixUrl(request).pathname;

			if (/.+\..+$/.test(oldPathname)) {
				response.statusCode = 404;
				response.setHeader('Content-Type', 'text/html');
				response.end("");
				return;
			}

			if (path !== "") {
				if (request.url !== path) {
					request.url = path;
					request._parsedUrl.pathname = path;
					request._parsedUrl.path = path;
					request._parsedUrl.href = path;
					request._parsedUrl._raw = path;
				}

				return this.handleRequest(request, response, data, errorObject);
			} else {
				response.statusCode = 500;
				response.setHeader('Content-Type', 'text/html');
				response.end("Forward error : forwardBridge");
			}
		}
	}, {
		key: "handleRequest",
		value: function handleRequest(request, response, data, errorObject) {
			var handler = new _RequestHandler2.default(this.config, this.reactRouter);
			handler.setRequest(request);
			handler.setResponse(response);
			handler.exec(data, errorObject);
		}
	}]);

	return AppCreator;
}(_lobenton.BaseComponent);

exports.default = AppCreator;