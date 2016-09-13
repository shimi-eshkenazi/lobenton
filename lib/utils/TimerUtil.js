"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var timerMap = {};

var TimerUtil = function () {
	function TimerUtil() {
		_classCallCheck(this, TimerUtil);
	}

	_createClass(TimerUtil, null, [{
		key: "start",
		value: function start(cate) {
			if (!timerMap[cate]) {
				var startTime = new Date().getTime();
				timerMap[cate] = {
					start: startTime
				};
			}

			console.log("Timer : '" + cate + "' is started");
		}
	}, {
		key: "end",
		value: function end(cate) {
			if (!timerMap[cate]) {
				console.log("Timer '" + cate + "' is not setting 'start'");
			} else {
				var endTime = new Date().getTime();
				console.log("Timer : '" + cate + "' is stoped");
				console.log("Spend time of " + cate + " : " + (endTime - timerMap[cate].start) / 1000);

				delete timerMap[cate];
			}
		}
	}]);

	return TimerUtil;
}();

exports.default = TimerUtil;