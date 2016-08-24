"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _lobenton = require("lobenton");

var _Utils = require("../utils/Utils.js");

var _Utils2 = _interopRequireDefault(_Utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ConponentCreator = function (_BaseComponent) {
	_inherits(ConponentCreator, _BaseComponent);

	function ConponentCreator(name) {
		_classCallCheck(this, ConponentCreator);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ConponentCreator).call(this));

		_this.name = _Utils2.default.capitalizeFirstLetter(name);
		return _this;
	}

	_createClass(ConponentCreator, [{
		key: "initial",
		value: function initial() {
			try {
				var componentSource = this.config.hasOwnProperty('class') ? _path2.default.resolve(this.config["class"]) : "./components/WebApp" + this.name;
				var component = require(componentSource);
				component = component.default || component;

				var componentInstance = new component();
				componentInstance.setConfig(this.config);
				var result = componentInstance.initial();

				if (result === "no impl!") {
					throw new Error("No impl 'initial' for system call in " + this.name);
				}

				return componentInstance;
			} catch (componentLoadError) {
				console.log(componentLoadError);
				return null;
			}
		}
	}]);

	return ConponentCreator;
}(_lobenton.BaseComponent);

exports.default = ConponentCreator;