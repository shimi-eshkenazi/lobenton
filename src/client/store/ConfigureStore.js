
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

var _logger = function __logger() {
	return function (store) {
		return function (next) {
			return function (action) {
				return next(action);
			};
		};
	};
};
const canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

function checkType(){
	return (store) => (next) => (action) => {
		action.type = action.type || action.CALL_API.type || null;
		return next(action);
	}
}

export default function ConfigureStore(rootReducer, middlewares, initialState) {
	if (canUseDOM && window.reduxLogger === true) {
		_logger = logger;
	} 
	
	const defaultMiddlewares = [thunk, checkType(), _logger()];
	const mergedMiddlewares = defaultMiddlewares.concat(middlewares);
	const applyMiddlewareWrap = applyMiddleware.apply(this, mergedMiddlewares);
	
	const store = createStore(
		rootReducer,
		initialState,
		applyMiddlewareWrap
	);

	if (module.hot) {
		module.hot.accept('src/client/reducers', () => {
			const nextReducer = require('src/client/reducers').default;
			store.replaceReducer(nextReducer)
		})
	}

	return store;
};