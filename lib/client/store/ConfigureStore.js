'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = ConfigureStore;

var _redux = require('redux');

var _reduxLogger = require('redux-logger');

var _reduxLogger2 = _interopRequireDefault(_reduxLogger);

var _reduxThunk = require('redux-thunk');

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ConfigureStore(rootReducer, middlewares, initialState) {
	var defaultMiddlewares = [_reduxThunk2.default, (0, _reduxLogger2.default)()];
	var mergedMiddlewares = defaultMiddlewares.concat(middlewares);
	var applyMiddlewareWrap = _redux.applyMiddleware.apply(this, mergedMiddlewares);

	var store = (0, _redux.createStore)(rootReducer, initialState, applyMiddlewareWrap);

	if (module.hot) {
		module.hot.accept('src/client/reducers', function () {
			var nextReducer = require('src/client/reducers').default;
			store.replaceReducer(nextReducer);
		});
	}

	return store;
};