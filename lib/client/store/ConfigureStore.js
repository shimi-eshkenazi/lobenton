'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = ConfigureStore;

var _redux = require('redux');

var _reduxThunk = require('redux-thunk');

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = null;
var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

if (!canUseDOM) {
	logger = function logger() {
		return function (store) {
			return function (next) {
				return function (action) {
					return next(action);
				};
			};
		};
	};
} else {
	logger = require('redux-logger');
	logger = logger.default || logger;
}

function checkType() {
	return function (store) {
		return function (next) {
			return function (action) {
				action.type = action.type || action.CALL_API.type || null;
				return next(action);
			};
		};
	};
}

function ConfigureStore(rootReducer, middlewares, initialState) {
	var defaultMiddlewares = [_reduxThunk2.default, checkType(), logger()];
	var mergedMiddlewares = defaultMiddlewares.concat(middlewares);
	var applyMiddlewareWrap = _redux.applyMiddleware.apply(this, mergedMiddlewares);

	var store = (0, _redux.createStore)(rootReducer, initialState, applyMiddlewareWrap);

	if (module.hot) {
		module.hot.accept('lib/client/reducers', function () {
			var nextReducer = require('lib/client/reducers').default;
			store.replaceReducer(nextReducer);
		});
	}

	return store;
};