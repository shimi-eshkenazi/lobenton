'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.filtering = exports.mapping = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

exports.default = WrapComponent;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reactI18next = require('react-i18next');

var _reactCssModules = require('react-css-modules');

var _reactCssModules2 = _interopRequireDefault(_reactCssModules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function WrapComponent() {
	var connectReturn = _reactRedux.connect.apply(this, arguments);

	return function wrap(component, css) {
		var ErrorHandlerComponent = function (_component) {
			_inherits(ErrorHandlerComponent, _component);

			function ErrorHandlerComponent(props, context) {
				_classCallCheck(this, ErrorHandlerComponent);

				return _possibleConstructorReturn(this, Object.getPrototypeOf(ErrorHandlerComponent).call(this, props, context));
			}

			_createClass(ErrorHandlerComponent, [{
				key: 'render',
				value: function render() {
					try {
						return _get(Object.getPrototypeOf(ErrorHandlerComponent.prototype), 'render', this).call(this);
					} catch (e) {
						console.log(e);
						e.stack = e.stack.replace(/WrappedComponent/, component.name);
						throw e;
					}
				}
			}]);

			return ErrorHandlerComponent;
		}(component);

		;

		var vewCss = (0, _reactCssModules2.default)(ErrorHandlerComponent, css, { allowMultiple: true });
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