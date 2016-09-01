"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _AppCreator = require('./AppCreator.js');

var _AppCreator2 = _interopRequireDefault(_AppCreator);

var _lobenton = require('lobenton');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ServerCreator = function (_BaseComponent) {
	_inherits(ServerCreator, _BaseComponent);

	function ServerCreator() {
		_classCallCheck(this, ServerCreator);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ServerCreator).call(this));

		_this.startTime = new Date().getTime();
		_this.endTime = null;
		_this.server = null;
		_this.app = null;
		return _this;
	}

	_createClass(ServerCreator, [{
		key: 'initial',
		value: function initial() {
			this.app = new _AppCreator2.default();

			var argv2 = process.argv[2] || null;
			if (this.config.env === "dev" && argv2 === "--dev") {
				var HMR = require("./HMR.js");
				HMR = HMR.default || HMR;

				HMR.change(function change() {
					this.app.setConfig(this.config);
				}.bind(this));
			}

			this.app.setConfig(this.config);
			this.app.initial();

			this.server = _http2.default.createServer(this.app.handleRequest.bind(this.app));
			this.server.listen(this.config.port);
			this.server.on('error', this.onError.bind(this));
			this.server.on('listening', this.onListening.bind(this));

			return this.server;
		}
	}, {
		key: 'getServer',
		value: function getServer() {
			return this.server;
		}
	}, {
		key: 'getApp',
		value: function getApp() {
			return this.app;
		}
	}, {
		key: 'onError',
		value: function onError(error) {
			if (error.syscall !== 'listen') {
				throw error;
			}

			var bind = typeof this.config.port === 'string' ? 'Pipe ' + port : 'Port ' + this.config.port;

			switch (error.code) {
				case 'EACCES':
					console.error(bind + ' requires elevated privileges');
					process.exit(1);
					break;
				case 'EADDRINUSE':
					console.error(bind + ' is already in use');
					process.exit(1);
					break;
				default:
					console.log("Get error");
					console.log(error);
					throw error;
			}

			throw error;
		}
	}, {
		key: 'onListening',
		value: function onListening() {
			this.endTime = new Date().getTime();
			console.log("Listening on port: " + this.config.port);
			console.log("Need Time : " + (this.endTime - this.startTime) / 1000);
			this.startTime = null;
			this.endTime = null;
		}
	}]);

	return ServerCreator;
}(_lobenton.BaseComponent);

exports.default = ServerCreator;