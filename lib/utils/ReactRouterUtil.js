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
		key: 'transformToFile',
		value: function transformToFile() {
			if (this.router !== null) {
				Object.keys(this.router).map(function loopRouteFirst(routeFirst) {
					var routeFirstValue = this.router[routeFirst];

					if (this.mainRouterArray.indexOf('\t\t\t<Route path="' + routeFirst + '" component={App}>') === -1) {
						this.mainRouterArray.push('\t\t\t<Route path="' + routeFirst + '" component={App}>');
					}

					Object.keys(routeFirstValue).map(function loopSubRoute(subRoute) {
						var routeValue = routeFirstValue[subRoute];
						var docParams = Object.keys(routeValue.docParams);
						var paramStr = docParams.reduce(function reduceParam(str, param, index) {
							if ([true, false, "true", "false"].indexOf(routeValue.docParams[param]) !== -1) {
								str += param + "={" + routeValue.docParams[param] + "} ";
							} else {
								str += param + '="' + routeValue.docParams[param] + '" ';
							}

							return str;
						}, "");

						if (this.importArray.indexOf('import ' + routeValue.viewName + ' from "' + routeValue.view + '";') === -1) {
							this.importArray.push('import ' + routeValue.viewName + ' from "' + routeValue.view + '";');
						}

						if (subRoute === "/") {
							this.mainRouterArray.push('\t\t\t\t<IndexRoute component={' + routeValue.viewName + '} ' + paramStr + '/>');
						} else {
							if (/\/$/.test(subRoute) && subRoute !== '/') {
								subRoute = subRoute.replace(/\/$/, '');
							}
							this.mainRouterArray.push('\t\t\t\t<Route path="' + subRoute + '" component={' + routeValue.viewName + '} ' + paramStr + '/>');
						}
					}.bind(this));

					this.mainRouterArray.push('\t\t\t</Route>');
				}.bind(this));
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