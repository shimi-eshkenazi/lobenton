'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _redux = require('redux');

var _history = require('./history.js');

var _history2 = _interopRequireDefault(_history);

var _language = require('./language.js');

var _language2 = _interopRequireDefault(_language);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _redux.combineReducers)({
	history: _history2.default,
	language: _language2.default
});