"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = userReducer;

var _deepAssign = require('deep-assign');

var _deepAssign2 = _interopRequireDefault(_deepAssign);

var _user = require('../actions/user');

var userActions = _interopRequireWildcard(_user);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function userReducer() {
	var state = arguments.length <= 0 || arguments[0] === undefined ? { pid: -3, userName: -3, isLogin: false, loginTime: 0 } : arguments[0];
	var action = arguments[1];

	switch (action.type) {
		case userActions.LOADED_USER:
			return action.response;

		case userActions.GET_AC_USERNAME:
			if (action.response && action.response.success === 'true') {
				state.userName = action.response.data;
			}
			return state;

		default:
			return state;
	}
};