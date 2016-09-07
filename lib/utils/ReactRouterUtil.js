"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ReactRouterUtil = function () {
	_createClass(ReactRouterUtil, null, [{
		key: 'createRouter',
		value: function createRouter(routers) {
			var reactRouterUtil = new ReactRouterUtil();
			reactRouterUtil.setRouter(routers);
			reactRouterUtil.transformToFile();

			return reactRouterUtil.getContent();
		}
	}]);

	function ReactRouterUtil() {
		_classCallCheck(this, ReactRouterUtil);

		this.router = null;
		this.importArray = ['"use strict";', '', 'import {App} from "lobenton/client";', 'import React from "react";', 'import { Router, Route, IndexRoute, browserHistory } from "react-router";'];
		this.mainBeforeArray = ['', 'export const ts = ' + new Date().getTime() + ";", 'export default function createRouter() {', '\treturn (', '\t\t<Router history={browserHistory}>'];
		this.mainRouterArray = [];
		this.mainAfterArray = ['\t\t</Router>', '\t);', '};'];
	}

	_createClass(ReactRouterUtil, [{
		key: 'setRouter',
		value: function setRouter(router) {
			this.router = router;
		}
	}, {
		key: 'toJsxRoute',
		value: function toJsxRoute(target, prefixName, tab) {
			var isAddTab = false;
			prefixName = prefixName || '';

			Object.keys(target).map(function loopRoute(route) {
				var routeValue = target[route];
				var docParams = routeValue.pattern ? Object.keys(routeValue.pattern.docParams) : [];
				var paramStr = docParams.reduce(function reduceParam(str, param, index) {
					if ([true, false, "true", "false"].indexOf(routeValue.pattern.docParams[param]) !== -1) {
						str += param + "={" + routeValue.pattern.docParams[param] + "} ";
					} else {
						str += param + '="' + routeValue.pattern.docParams[param] + '" ';
					}

					return str;
				}, "");

				if (routeValue.pattern !== '' && routeValue.subRules !== null) {
					if (this.importArray.indexOf('import ' + routeValue.pattern.viewName + ' from "' + routeValue.pattern.view + '";') === -1) {
						this.importArray.push('import ' + routeValue.pattern.viewName + ' from "' + routeValue.pattern.view + '";');
					}

					this.mainRouterArray.push(tab + '<Route path="' + (prefixName + route) + '" component={' + routeValue.pattern.viewName + '} ' + paramStr + '>');
					this.toJsxRoute(routeValue.subRules, "", tab + "\t");
					this.mainRouterArray.push(tab + '</Route>');
				} else if (routeValue.pattern !== '' && routeValue.subRules === null) {
					if (this.importArray.indexOf('import ' + routeValue.pattern.viewName + ' from "' + routeValue.pattern.view + '";') === -1) {
						this.importArray.push('import ' + routeValue.pattern.viewName + ' from "' + routeValue.pattern.view + '";');
					}

					if (prefixName + route === "/") {
						this.mainRouterArray.push(tab + '<IndexRoute component={' + routeValue.pattern.viewName + '} ' + paramStr + '/>');
					} else {
						if (route === "/") {
							this.mainRouterArray.push(tab + '<Route path="' + prefixName + '" component={' + routeValue.pattern.viewName + '} ' + paramStr + '/>');
						} else {
							this.mainRouterArray.push(tab + '<Route path="' + (prefixName + route) + '" component={' + routeValue.pattern.viewName + '} ' + paramStr + '/>');
						}
					}
				} else if (routeValue.pattern === '' && routeValue.subRules !== null) {
					this.toJsxRoute(routeValue.subRules, route, tab);
				}
			}.bind(this));
		}
	}, {
		key: 'transformToFile',
		value: function transformToFile() {
			if (this.router !== null) {
				this.mainRouterArray.push('\t\t\t<Route path="/" component={App}>');
				this.toJsxRoute(this.router.subRules, "", '\t\t\t\t');
				this.mainRouterArray.push('\t\t\t</Route>');
			}
		}
	}, {
		key: 'getContent',
		value: function getContent() {
			var result = this.importArray.concat(this.mainBeforeArray, this.mainRouterArray, this.mainAfterArray);
			return result.join("\r\n");
		}
	}]);

	return ReactRouterUtil;
}();

exports.default = ReactRouterUtil;