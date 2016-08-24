"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.CHANGED_LANGUAGE = undefined;
exports.changeLanguage = changeLanguage;

var _CookieUtil = require("../../utils/CookieUtil.js");

var _CookieUtil2 = _interopRequireDefault(_CookieUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CHANGED_LANGUAGE = exports.CHANGED_LANGUAGE = "CHANGED_LANGUAGE";
function changeLanguage(language) {
	_CookieUtil2.default.setCookie('locale', language, 900000, '/');

	return {
		type: CHANGED_LANGUAGE,
		response: language
	};
};