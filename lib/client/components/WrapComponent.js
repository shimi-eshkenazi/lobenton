'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.filtering = exports.mapping = undefined;
exports.default = WrapComponent;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reactI18next = require('react-i18next');

var _reactCssModules = require('react-css-modules');

var _reactCssModules2 = _interopRequireDefault(_reactCssModules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function WrapComponent() {
	var connectReturn = _reactRedux.connect.apply(this, arguments);

	return function wrap(component, css) {
		/*
  class ErrorHandlerComponent extends component {
  	constructor( props, context ){
  		super( props, context );
  	}
  	
  	render(){
  		try{
  			return super.render();
  		}catch(e){
  			e.stack = e.stack.replace(/WrappedComponent/, component.name);
  			throw e;
  		}
  	}
  };
  */
		var vewCss = (0, _reactCssModules2.default)(component, css, { allowMultiple: true });
		var viewTranslate = (0, _reactI18next.translate)([])(vewCss);
		return connectReturn(viewTranslate);
	};
};

var mapping = exports.mapping = function mapping(func) {
	return function (reducing) {
		return function (result, input) {
			return reducing(result, func(input));
		};
	};
};
var filtering = exports.filtering = function filtering(test) {
	return function (reducing) {
		return function (result, input) {
			return test(input) ? reducing(result, input) : result;
		};
	};
};