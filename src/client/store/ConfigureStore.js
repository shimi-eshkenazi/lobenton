
import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';

export default function ConfigureStore(rootReducer, middlewares, initialState) {
	const defaultMiddlewares = [thunk, logger()];
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