"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cookie2 = require("cookie");

var _cookie3 = _interopRequireDefault(_cookie2);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _deepAssign = require("deep-assign");

var _deepAssign2 = _interopRequireDefault(_deepAssign);

var _redux = require("redux");

var _server = require("react-dom/server");

var _server2 = _interopRequireDefault(_server);

var _reactRouter = require("react-router");

var _reactRedux = require("react-redux");

var _reactI18next = require("react-i18next");

var _history = require("history");

var _asyncBeApi = require("./asyncBeApi.js");

var _asyncBeApi2 = _interopRequireDefault(_asyncBeApi);

var _BaseComponent2 = require("./BaseComponent.js");

var _BaseComponent3 = _interopRequireDefault(_BaseComponent2);

var _FileUtil = require("../../utils/FileUtil.js");

var _FileUtil2 = _interopRequireDefault(_FileUtil);

var _DeviceDetector = require("../../utils/DeviceDetector.js");

var _DeviceDetector2 = _interopRequireDefault(_DeviceDetector);

var _I18nDetector = require("../../utils/I18nDetector.js");

var _I18nDetector2 = _interopRequireDefault(_I18nDetector);

var _App = require("../../client/components/App.js");

var _App2 = _interopRequireDefault(_App);

var _ConfigureStore = require("../../client/store/ConfigureStore.js");

var _ConfigureStore2 = _interopRequireDefault(_ConfigureStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Lobenton = null;

var BaseController = function (_BaseComponent) {
	_inherits(BaseController, _BaseComponent);

	function BaseController() {
		_classCallCheck(this, BaseController);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BaseController).call(this));

		_this.layout = null;
		_this.view = null;
		_this.controller = null;
		_this.action = null;
		_this.controllerPath = null;
		_this.request = null;
		_this.response = null;
		_this.reactRouter = null;
		_this.httpMethod = null;
		_this.paramMap = {};
		_this.headerMap = {};
		_this.cookieMap = {};
		_this.setCookie;
		_this.store = null;
		_this.state = {};
		_this.tmp = {};
		_this.filterResult = null;
		_this.device = null;
		_this.deviceDetector = null;
		_this.deviceDetectorInstance = null;
		_this.language = null;
		_this.i18nDetector = null;
		_this.i18nDetectorInstance = null;
		_this.afterContinueCallback = null;
		return _this;
	}

	_createClass(BaseController, [{
		key: "initial",
		value: function initial(fromRequest) {
			this.controllerPath = this.controllerPath.replace(/\/lib\//g, "/src/");

			_FileUtil2.default.fixControllerMethod(this);

			if (fromRequest === true) {
				this.deviceDetector = new _DeviceDetector2.default();
				this.deviceDetector.setDefaultDevice(_DeviceDetector2.default.DESKTOP);
				this.deviceDetector.detect(this.request);
				this.deviceDetectorInstance = this.deviceDetector.getRealInstance();
				this.device = this.deviceDetector.getDevice();

				this.i18nDetector = new _I18nDetector2.default();
				this.i18nDetector.setDefaultLanguage(_I18nDetector2.default.ZHTW);
				this.i18nDetector.setLocalesPath("lib/client/locales");
				this.i18nDetector.detect(this.cookieMap);
				this.i18nDetectorInstance = this.i18nDetector.getRealInstance();
				this.language = this.i18nDetector.getLanguage();
			}
		}
	}, {
		key: "setControllerPath",
		value: function setControllerPath(controllerPath) {
			this.controllerPath = controllerPath;
		}
	}, {
		key: "setRequest",
		value: function setRequest(request) {
			this.request = request;
		}
	}, {
		key: "getRequest",
		value: function getRequest() {
			return this.request;
		}
	}, {
		key: "setResponse",
		value: function setResponse(response) {
			this.response = response;
		}
	}, {
		key: "getResponse",
		value: function getResponse() {
			return this.response;
		}
	}, {
		key: "setReactRouter",
		value: function setReactRouter(reactRouter) {
			this.reactRouter = reactRouter;
		}
	}, {
		key: "setView",
		value: function setView(view) {
			this.view = view;
		}
	}, {
		key: "setFilterResult",
		value: function setFilterResult(filterResult) {
			this.filterResult = filterResult;
		}
	}, {
		key: "set",
		value: function set(key, value) {
			this.tmp[key] = value;
		}
	}, {
		key: "get",
		value: function get(key) {
			return this.tmp[key];
		}
	}, {
		key: "setController",
		value: function setController(controller) {
			this.controller = controller;
		}
	}, {
		key: "getController",
		value: function getController() {
			return this.controller;
		}
	}, {
		key: "setAction",
		value: function setAction(action) {
			this.action = action;
		}
	}, {
		key: "getAction",
		value: function getAction() {
			return this.action;
		}
	}, {
		key: "setHeaderMap",
		value: function setHeaderMap(headerMap) {
			this.headerMap = headerMap;
		}
	}, {
		key: "getHeaderMap",
		value: function getHeaderMap() {
			return this.headerMap;
		}
	}, {
		key: "setCookieMap",
		value: function setCookieMap(cookieMap) {
			this.cookieMap = cookieMap;
		}
	}, {
		key: "getCookieMap",
		value: function getCookieMap() {
			return this.cookieMap;
		}
	}, {
		key: "setParamMap",
		value: function setParamMap(paramMap) {
			this.paramMap = paramMap;
		}
	}, {
		key: "setNowHttpMethod",
		value: function setNowHttpMethod(httpMethod) {
			this.httpMethod = httpMethod;
		}
	}, {
		key: "getNowHttpMethod",
		value: function getNowHttpMethod() {
			return this.httpMethod;
		}
	}, {
		key: "getParamMap",
		value: function getParamMap() {
			return this.paramMap;
		}
	}, {
		key: "getProtocol",
		value: function getProtocol() {
			var proto = this.request.connection.encrypted ? 'https' : 'http';
			proto = this.request.headers['X-Forwarded-Proto'] || proto;
			return proto.split(/\s*,\s*/)[0];
		}
	}, {
		key: "getHost",
		value: function getHost() {
			return this.request.headers.host;
		}
	}, {
		key: "sendBody",
		value: function sendBody(statusCode, body) {
			this.response.statusCode = statusCode;
			this.response.end(body, "UTF-8");
		}
	}, {
		key: "continue",
		value: function _continue(result) {
			this.afterContinueCallback(result);
		}
	}, {
		key: "afterContinue",
		value: function afterContinue(callback) {
			this.afterContinueCallback = callback;
		}
	}, {
		key: "setState",
		value: function setState(reducerName, state) {
			this.state[reducerName] = state;
		}
	}, {
		key: "dispatchToStore",
		value: function dispatchToStore(sourceState) {
			var mainReducers = require("lib/client/reducers");
			mainReducers = mainReducers.default || mainReducers;

			this.state = Object.assign(this.state, sourceState);
			this.state["language"] = this.language;
			this.state["history"] = {
				prevUrl: this.request.query.r || this.request.headers['referer'] || '/',
				currentUrl: this.request.url
			};

			if (/layout/g.test(this.state.history.prevUrl)) {
				this.state.history.prevUrl = "/";
			}

			this.store = (0, _ConfigureStore2.default)(mainReducers, [(0, _asyncBeApi2.default)(this.config, this.request)], this.state);

			return this.store.getState();
		}
	}, {
		key: "render",
		value: function render(passToLayoutWithoutRedux, sourceState) {
			var _this2 = this;

			if (!passToLayoutWithoutRedux && !sourceState) {
				passToLayoutWithoutRedux = {};
				sourceState = {};
			} else if (passToLayoutWithoutRedux && !sourceState) {
				sourceState = passToLayoutWithoutRedux;
				passToLayoutWithoutRedux = {};

				var sourceStateType = typeof sourceState === "undefined" ? "undefined" : _typeof(sourceState);
				if (sourceStateType !== 'object') {
					throw new Error("Arguments of controller render must be object, " + sourceStateType + " given.");
				}
			} else {
				var passToLayoutWithoutReduxType = typeof passToLayoutWithoutRedux === "undefined" ? "undefined" : _typeof(passToLayoutWithoutRedux);
				if (passToLayoutWithoutReduxType !== 'object') {
					throw new Error("Argument 1 of controller render must be object, " + passToLayoutWithoutReduxType + " given.");
				}

				var sourceStateType = typeof sourceState === "undefined" ? "undefined" : _typeof(sourceState);
				if (sourceStateType !== 'object') {
					throw new Error("Argument 2 of controller render must be object, " + sourceStateType + " given.");
				}
			}

			try {
				(function () {
					var layoutSource = "";
					var viewSource = "";
					var history = (0, _reactRouter.useRouterHistory)((0, _history.useQueries)(_history.createMemoryHistory))();
					var location = history.createLocation(_this2.request.url);
					var routes = _this2.reactRouter(history);

					sourceState = sourceState || {};

					if (_this2.layout) {
						_this2.layout = _this2.layout.replace(/^src\//, "lib/");
						layoutSource = require(_this2.layout);
					} else {
						throw new Error("Layout is not defined on action : " + _this2.layout);
					}

					sourceState = _this2.beforeRender(sourceState);
					sourceState = _this2.dispatchToStore(sourceState);
					layoutSource = layoutSource.default || layoutSource;
					passToLayoutWithoutRedux.reduxState = sourceState;

					(0, _reactRouter.match)({ routes: routes, location: location }, function matchHandle(error, redirectLocation, renderProps) {
						try {
							if (redirectLocation) {
								this.redirect(301, redirectLocation.pathname + redirectLocation.search);
							} else if (error) {
								this.forwardUrl("error/500", error);
							} else if (!renderProps) {
								this.forwardUrl("error/404");
							} else {
								var routerContext = _react2.default.createElement(_reactRouter.RouterContext, Object.assign({}, renderProps));
								var layout = _react2.default.createElement(layoutSource, passToLayoutWithoutRedux, routerContext);
								var i18nextProvider = _react2.default.createElement(_reactI18next.I18nextProvider, { i18n: this.i18nDetectorInstance }, layout);
								var provider = _react2.default.createElement(_reactRedux.Provider, { store: this.store }, i18nextProvider);

								var html = _server2.default.renderToString(provider);
								html = '<!DOCTYPE lang="en">' + html;

								if (this.i18nDetector.getNeedSetCookie() === true) {
									this.cookie('locale', _I18nDetector2.default.ZHTW, { maxAge: 900000, httpOnly: false });
								}

								html = this.afterRender(html);
								this.response.setHeader('Content-Type', 'text/html');
								this.response.setHeader('X-Powered-By', 'Lobenton');
								this.sendBody(200, html);
							}
						} catch (jsxError) {
							this.forwardUrl("error/500", jsxError);
						}
					}.bind(_this2));
				})();
			} catch (renderError) {
				console.log(renderError);
				throw renderError;
			}
		}
	}, {
		key: "json",
		value: function json(result, callbackName) {
			if (typeof callbackName !== "undefined") {
				return this.jsonp(result, callbackName);
			}

			var paramMap = this.getParamMap();
			if (typeof paramMap.callback !== "undefined") {
				return this.jsonp(result, paramMap.callback);
			}

			this.response.setHeader('Content-Type', 'application/json');
			this.sendBody(200, JSON.stringify(result));
		}
	}, {
		key: "jsonp",
		value: function jsonp(result, callbackName) {
			this.response.setHeader('Content-Type', 'application/javascript');
			this.sendBody(200, callbackName + "(" + JSON.stringify(result) + ")");
		}
	}, {
		key: "download",
		value: function download(fileName) {
			this.sendBody(200, fileName);
		}
	}, {
		key: "cookie",
		value: function cookie(name, value, options) {
			var cookieList = this.response.getHeader('Set-Cookie');
			options = options || {};

			if (cookieList) {
				cookieList.push(_cookie3.default.serialize(name, String(value), options));
			} else {
				cookieList = [_cookie3.default.serialize(name, String(value), options)];
			}

			this.response.setHeader('Set-Cookie', cookieList);
		}
	}, {
		key: "clearCookie",
		value: function clearCookie(name) {
			this.cookie(name, "", { maxAge: -900000, httpOnly: false });
		}
	}, {
		key: "createUrl",
		value: function createUrl(path) {
			if (/^\//.test(path)) {
				return this.getProtocol() + "://" + this.getHost() + path;
			} else {
				return this.getProtocol() + "://" + this.getHost() + "/" + path;
			}
		}
	}, {
		key: "location",
		value: function location(path) {
			var targetUrl = "";

			if (/^http.+/.test(path)) {
				targetUrl = path;
			} else if (/^\/\/.+/.test(path)) {
				targetUrl = this.getProtocol() + path;
			} else {
				targetUrl = this.createUrl(path);
			}

			this.response.setHeader('Location', targetUrl);
			this.sendBody(200, "");
		}
	}, {
		key: "redirect",
		value: function redirect(path) {
			var address = path;
			var status = 302;

			if (arguments.length === 2) {
				if (typeof arguments[0] === 'number') {
					status = arguments[0];
					address = arguments[1];
				} else {
					status = arguments[1];
				}
			}

			this.response.setHeader('Location', address);
			this.sendBody(status, "");
		}
	}, {
		key: "forwardUrl",
		value: function forwardUrl(path, data) {
			if (!Lobenton) {
				Lobenton = require("lobenton");
				Lobenton = Lobenton.default || Lobenton;
			}

			path = "/" + path || "";
			data = data || {};
			Lobenton.getApp().forwardBridge(path, data, this.request, this.response);
		}
	}, {
		key: "forward",
		value: function forward(path, data) {
			/*if(!Lobenton){
   	Lobenton = require("lobenton");
   	Lobenton = Lobenton.default || Lobenton;
   }
   	path = "/"+path || "";
   data = data || {};
   Lobenton.getApp().forwardBridge(path, data, this.request, this.response);*/
		}
	}, {
		key: "beforeAction",
		value: function beforeAction() {}
	}, {
		key: "afterAction",
		value: function afterAction() {}
	}, {
		key: "beforeRender",
		value: function beforeRender(sourceState) {
			return sourceState;
		}
	}, {
		key: "afterRender",
		value: function afterRender(html) {
			return html;
		}
	}]);

	return BaseController;
}(_BaseComponent3.default);

exports.default = BaseController;