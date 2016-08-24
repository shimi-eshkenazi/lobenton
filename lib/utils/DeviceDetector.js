"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mobileDetect = require("mobile-detect");

var _mobileDetect2 = _interopRequireDefault(_mobileDetect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DeviceDetector = function () {
	function DeviceDetector() {
		_classCallCheck(this, DeviceDetector);

		this.defaultDevice = null;
		this.nowDevice = null;
		this.mobileDetect = null;
	}

	_createClass(DeviceDetector, [{
		key: "setDefaultDevice",
		value: function setDefaultDevice(device) {
			this.defaultDevice = device;
		}
	}, {
		key: "detect",
		value: function detect(request) {
			this.mobileDetect = new _mobileDetect2.default(request.headers['user-agent']);
			this.nowDevice = this.defaultDevice;

			try {
				if (this.mobileDetect.mobile() === null && this.mobileDetect.tablet() === null) {
					this.nowDevice = 'desktop';
				} else if (this.mobileDetect.mobile() !== null && this.mobileDetect.tablet() === null) {
					this.nowDevice = 'mobile';
				} else {
					this.nowDevice = 'tablet';
				}
			} catch (e) {}
		}
	}, {
		key: "getRealInstance",
		value: function getRealInstance() {
			return this.mobileDetect;
		}
	}, {
		key: "getDevice",
		value: function getDevice() {
			return this.nowDevice;
		}
	}]);

	return DeviceDetector;
}();

DeviceDetector.DESKTOP = "desktop";
DeviceDetector.MOBILE = "mobile";
DeviceDetector.TABLET = "tablet";

exports.default = DeviceDetector;