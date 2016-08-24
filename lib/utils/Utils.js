"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _is = require("is");

var _is2 = _interopRequireDefault(_is);

var _parseurl = require("parseurl");

var _parseurl2 = _interopRequireDefault(_parseurl);

var _qs = require("qs");

var _qs2 = _interopRequireDefault(_qs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Utils = function () {
	function Utils() {
		_classCallCheck(this, Utils);
	}

	_createClass(Utils, null, [{
		key: "fixUrl",
		value: function fixUrl(request) {
			return (0, _parseurl2.default)(request);
		}
	}, {
		key: "fixQuery",
		value: function fixQuery() {
			return function query(request, response, next) {
				if (!request.query) {
					var parseResult = Utils.fixUrl(request).query;
					request.query = _qs2.default.parse(parseResult, {});
				}

				next();
			};
		}
	}, {
		key: "capitalizeFirstLetter",
		value: function capitalizeFirstLetter(string) {
			if (!string) {
				return string;
			}

			return string.charAt(0).toUpperCase() + string.slice(1);
		}
	}, {
		key: "lowerFirstLetter",
		value: function lowerFirstLetter(string) {
			if (!string) {
				return string;
			}

			return string.charAt(0).toLowerCase() + string.slice(1);
		}
	}, {
		key: "getPosition",
		value: function getPosition(string, keyword, index) {
			return string.split(keyword, index).join(keyword).length;
		}
	}, {
		key: "getAllMethods",
		value: function getAllMethods(target) {
			return Object.getOwnPropertyNames(target).filter(function (key) {
				return _is2.default.fn(target[key]);
			});
		}
	}]);

	return Utils;
}();

exports.default = Utils;