"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Utils = exports.I18nDetector = exports.DeviceDetector = exports.ExtendableError = exports.BaseComponent = exports.BaseController = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _HMR = require("./server/HMR.js");

var _HMR2 = _interopRequireDefault(_HMR);

var _BaseController = require("./server/components/BaseController.js");

var _BaseController2 = _interopRequireDefault(_BaseController);

var _BaseComponent = require("./server/components/BaseComponent.js");

var _BaseComponent2 = _interopRequireDefault(_BaseComponent);

var _ExtendableError = require("./server/components/ExtendableError.js");

var _ExtendableError2 = _interopRequireDefault(_ExtendableError);

var _DeviceDetector = require("./utils/DeviceDetector.js");

var _DeviceDetector2 = _interopRequireDefault(_DeviceDetector);

var _I18nDetector = require("./utils/I18nDetector.js");

var _I18nDetector2 = _interopRequireDefault(_I18nDetector);

var _Utils = require("./utils/Utils.js");

var _Utils2 = _interopRequireDefault(_Utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Lobenton = function () {
	function Lobenton() {
		_classCallCheck(this, Lobenton);

		this.configPath = "";
		this.creator = null;
	}

	_createClass(Lobenton, null, [{
		key: "createApplication",
		value: function createApplication(configPath) {
			if (process.env.NODE_ENV !== 'dev') {
				configPath = configPath.replace(/^src/, "lib");
			}

			this.configPath = configPath;

			require('css-modules-require-hook')({
				generateScopedName: '[name]__[local]___[hash:base64:5]'
			});

			var ServerCreator = require("./server/ServerCreator.js");
			ServerCreator = ServerCreator.default || ServerCreator;

			var config = require(configPath);
			config = config.default || config;

			this.creator = new ServerCreator();
			this.creator.setConfig(config);

			(0, _HMR2.default)(config.basePath, function change() {
				config = require(configPath);
				config = config.default || config;
				this.creator.setConfig(config);
			}.bind(this));

			return Lobenton;
		}
	}, {
		key: "run",
		value: function run() {
			return this.creator.initial();
		}
	}, {
		key: "getConfig",
		value: function getConfig() {
			return this.creator.getConfig();
		}
	}, {
		key: "getServer",
		value: function getServer() {
			return this.creator.getServer();
		}
	}, {
		key: "getApp",
		value: function getApp() {
			return this.creator.getApp();
		}
	}, {
		key: "setComponent",
		value: function setComponent(componentName, componentSetting) {
			return this.creator.getApp().createComponent(componentName, componentSetting);
		}
	}, {
		key: "getComponent",
		value: function getComponent(componentName) {
			return this.creator.getApp().getComponent(componentName);
		}
	}]);

	return Lobenton;
}();

exports.BaseController = _BaseController2.default;
exports.BaseComponent = _BaseComponent2.default;
exports.ExtendableError = _ExtendableError2.default;
exports.DeviceDetector = _DeviceDetector2.default;
exports.I18nDetector = _I18nDetector2.default;
exports.Utils = _Utils2.default;
exports.default = Lobenton;