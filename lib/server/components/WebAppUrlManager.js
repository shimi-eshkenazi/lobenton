"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _deepAssign = require("deep-assign");

var _deepAssign2 = _interopRequireDefault(_deepAssign);

var _Utils = require("../../utils/Utils.js");

var _Utils2 = _interopRequireDefault(_Utils);

var _lobenton = require("lobenton");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var isStart = JSON.parse(process.env.npm_config_argv).original.slice(-1).pop() === "start";

function targetToMap(ruleValue) {
	var result = null;
	var targetMap = {};
	var re = new RegExp("\\/(((?!\\/).)*)", "gi");

	ruleValue = /^\//.test(ruleValue) ? ruleValue : "/" + ruleValue;

	while (result = re.exec(ruleValue)) {
		if (result["index"] === 0) {
			targetMap['controller'] = result[1];
		} else {
			targetMap['action'] = result[1];
		}
	}

	return { mapping: targetMap };
}

function patternToMap(pattern) {
	if (!pattern) {
		return { regex: "", mapping: {} };
	}

	var result = null;
	var patternMap = {};
	var regexArray = [];
	var re = new RegExp("\\/(((?!\\/).)*)", "gi");

	pattern = /^\//.test(pattern) ? pattern : "/" + pattern;

	while (result = re.exec(pattern)) {
		var partResult = result[1];

		if (/^\:/.test(partResult)) {
			var paramRe = new RegExp("^\\:(.+)(\\(.+\\))");

			if (!paramRe.test(partResult)) {
				partResult = partResult + "(\\w+)";
			}

			var paramReResult = paramRe.exec(partResult);

			patternMap[paramReResult[1]] = paramReResult[2];
			regexArray.push(paramReResult[2]);
		} else {
			if (partResult === "*") {
				patternMap[partResult] = "(|.+)";

				if (partResult) {
					regexArray.push("(|.+)");
				}
			} else {
				if (/^\d+$/g.test(partResult)) {
					patternMap["d" + partResult] = "(" + partResult + ")";
				} else {
					patternMap[partResult] = "(" + partResult + ")";
				}

				if (partResult) {
					regexArray.push("(" + partResult + ")");
				}
			}
		}
	}

	var regexStr = "\\/" + regexArray.join('\\/');

	return { regex: regexStr, mapping: patternMap };
}

function toRuleMap(rule, ruleValue) {
	if ((typeof ruleValue === "undefined" ? "undefined" : _typeof(ruleValue)) === "object") {
		return Object.keys(ruleValue).reduce(function loopRule(newObj, subRuleHasRegex, subRuleHasRegexIndex) {
			var ruleValueMap = toRuleMap(subRuleHasRegex, ruleValue[subRuleHasRegex]);

			Object.keys(ruleValueMap).map(function loop(ruleValueMapRegex) {
				var ruleMap = patternToMap(rule);
				var ruleValueMapMapping = ruleValueMap[ruleValueMapRegex];

				if (ruleMap.regex) {
					(function () {
						var newMapping = ruleMap.mapping;

						Object.keys(ruleValueMapMapping).map(function loopParam(param) {
							newMapping[param] = ruleValueMapMapping[param];
						});

						if (/^\\\/$/.test(ruleMap.regex)) {
							newObj[ruleValueMapRegex] = newMapping;
						} else {
							newObj[ruleMap.regex + ruleValueMapRegex] = newMapping;
						}
					})();
				} else {
					newObj[ruleValueMapRegex] = ruleValueMapMapping;
				}
			});

			return newObj;
		}, {});
	} else {
		var ruleMap = patternToMap(rule);
		var ruleValueMap = targetToMap(ruleValue);

		return _defineProperty({}, ruleMap.regex, (0, _deepAssign2.default)(ruleMap.mapping, ruleValueMap.mapping));
	}
}

var WebAppUrlManager = function (_BaseComponent) {
	_inherits(WebAppUrlManager, _BaseComponent);

	function WebAppUrlManager() {
		_classCallCheck(this, WebAppUrlManager);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WebAppUrlManager).call(this));

		_this.rulesRegex = {};
		return _this;
	}

	_createClass(WebAppUrlManager, [{
		key: "initial",
		value: function initial() {
			if (this.config.rules !== null) {
				this.rulesRegex = toRuleMap("", this.config.rules);
			}

			if (!this.config.hasOwnProperty("controllerPath")) {
				this.config.controllerPath = ['lib/server/controllers'];
			}
		}
	}, {
		key: "do",
		value: function _do(pathname) {
			var rulesRegex = Object.keys(this.rulesRegex);
			var alreadyMatched = false;
			var matchResult = {
				controller: null,
				action: null,
				paramMap: {}
			};

			pathname = pathname === "/" ? "/" : pathname.replace(/\/$/, "");

			if (!pathname || Object.keys(rulesRegex).length === 0 || pathname && /\.\w+$/.test(pathname)) {
				return matchResult;
			}

			rulesRegex.map(function loopRule(rule) {
				var _this2 = this;

				var newRule = rule.replace(/(.+)\\\/$/, "$1");
				var testRegex = new RegExp("^" + newRule + "$");
				var result = testRegex.exec(pathname);

				if (result !== null && !alreadyMatched) {
					(function () {
						var ruleValue = _this2.rulesRegex[rule];

						matchResult.paramMap = Object.keys(ruleValue).reduce(function getResult(newObj, key, index) {
							var value = ruleValue[key];
							var re = new RegExp(value, "gi");
							var param = /^d(\d+)$/.test(key) ? key.replace(/^d/, "") : key;

							if (re.test(result[index + 1])) {
								if (param !== result[index + 1]) {
									newObj[param] = result[index + 1];
								}
							} else {
								newObj[param] = value;
							}

							return newObj;
						}, {});

						alreadyMatched = true;
					})();
				}
			}.bind(this));

			if (matchResult.paramMap.controller) {
				matchResult.controller = matchResult.paramMap.controller;
				matchResult.action = matchResult.paramMap.action;
			}

			matchResult.controllerPath = this.config.controllerPath;

			return matchResult;
		}
	}]);

	return WebAppUrlManager;
}(_lobenton.BaseComponent);

exports.default = WebAppUrlManager;