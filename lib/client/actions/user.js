"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.loadUser = loadUser;
exports.getACUserName = getACUserName;
var LOADED_USER = exports.LOADED_USER = "LOADED_USER";
function loadUser(params) {
	return {
		'CALL_API': {
			type: LOADED_USER,
			method: 'get',
			target: '/user/:pid',
			params: params
		}
	};
};

var GET_AC_USERNAME = exports.GET_AC_USERNAME = "GET_AC_USERNAME";
function getACUserName(params) {
	return {
		'CALL_API': {
			type: GET_AC_USERNAME,
			method: 'get',
			target: '/account/name',
			params: params
		}
	};
};