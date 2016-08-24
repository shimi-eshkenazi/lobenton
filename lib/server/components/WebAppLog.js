"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _deepAssign = require("deep-assign");

var _deepAssign2 = _interopRequireDefault(_deepAssign);

var _log4js = require("log4js");

var _log4js2 = _interopRequireDefault(_log4js);

var _lobenton = require("lobenton");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function createAppenders(config) {
	var newAppenders = [];

	Object.keys(config.rules).map(function loopRule(levelName, index) {
		var levelSetting = config.rules[levelName];

		levelSetting.type = "file", levelSetting.category = levelName;

		if (levelSetting.hasOwnProperty("filename")) {
			if (!/\//.test(levelSetting.filename)) {
				if (config.hasOwnProperty("filepath")) {
					levelSetting.filename = _path2.default.join(config.filepath, levelSetting.filename);
				} else {
					levelSetting.filename = _path2.default.join(config.basePath + "/runtime", levelSetting.filename);
				}
			}
		} else {
			if (config.hasOwnProperty("filepath")) {
				levelSetting.filename = _path2.default.join(config.filepath, levelName + ".log");
			} else {
				levelSetting.filename = _path2.default.join(config.basePath + "/runtime", levelName + ".log");
			}
		}

		newAppenders.push(levelSetting);
	});

	return newAppenders;
}

var WebAppLog = function (_BaseComponent) {
	_inherits(WebAppLog, _BaseComponent);

	function WebAppLog() {
		_classCallCheck(this, WebAppLog);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(WebAppLog).call(this));
	}

	_createClass(WebAppLog, [{
		key: "initial",
		value: function initial() {
			var config = { appenders: [] };
			var newAppenders = [];

			if (this.config.hasOwnProperty("replaceConsole") && this.config.replaceConsole === true) {
				config.replaceConsole = this.config.replaceConsole;
			}

			if (this.config.hasOwnProperty("showConsole") && this.config.showConsole === true) {
				config.appenders.push({ "type": "console" });
			}

			if (this.config.hasOwnProperty("format")) {
				config.format = this.config.format;
			}

			if (this.config.rules !== null) {
				newAppenders = createAppenders(this.config);
			}

			config.appenders = config.appenders.concat(newAppenders);

			_log4js2.default.configure(config);
		}
	}, {
		key: "getLogger",
		value: function getLogger(levelName) {
			if (levelName) {
				return this.config.rules.hasOwnProperty(levelName) && this.config.rules[levelName].enabled ? _log4js2.default.getLogger(levelName) : null;
			} else {
				return _log4js2.default;
			}
		}
	}, {
		key: "do",
		value: function _do(levelName, errorObject) {
			var logger = this.getLogger(levelName);

			if (logger) {
				logger.error(errorObject);
			}
		}
	}]);

	return WebAppLog;
}(_lobenton.BaseComponent);

exports.default = WebAppLog;