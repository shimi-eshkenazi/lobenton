
import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';

export default function ConfigureStore(rootReducer, initialState) {
	const store = createStore(
		rootReducer,
		initialState,
		applyMiddleware(thunk, logger())
	);

	if (module.hot) {
		module.hot.accept('src/client/reducers', () => {
			const nextReducer = require('src/client/reducers').default;
			store.replaceReducer(nextReducer)
		})
	}

	return store;
};