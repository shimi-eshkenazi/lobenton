"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _Utils = require("../../utils/Utils.js");

var _Utils2 = _interopRequireDefault(_Utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ExtendableError = function (_Error) {
	_inherits(ExtendableError, _Error);

	function ExtendableError(message) {
		_classCallCheck(this, ExtendableError);

		var errorObject = null;
		var stack = null;

		if ((typeof message === "undefined" ? "undefined" : _typeof(message)) === 'object') {
			errorObject = message;
			message = errorObject.message;
			stack = errorObject.stack;
		} else {
			var thisError = new Error(message);
			stack = thisError.stack;
		}

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ExtendableError).call(this, message));

		_this.message = message;
		_this.stack = stack;

		if (/\[\d+\w/.test(_this.stack)) {
			_this.stack = _this.stack.replace(/\[\d+\w/g, "");
			_this.stack = _this.stack.replace(/\satform/g, " at form");
		}

		_this.stack = _this.stack.replace("<", "&lt;").replace(">", "&gt;");
		return _this;
	}

	return ExtendableError;
}(Error);

exports.default = ExtendableError;