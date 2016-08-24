"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = languageReducer;

var _language = require('../actions/language');

var languageActions = _interopRequireWildcard(_language);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function languageReducer() {
	var state = arguments.length <= 0 || arguments[0] === undefined ? 'zhTW' : arguments[0];
	var action = arguments[1];

	switch (action.type) {
		case languageActions.CHANGED_LANGUAGE:
			return action.response;

		default:
			return state;
	}
};