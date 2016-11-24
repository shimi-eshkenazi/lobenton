
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

let logger = null;
const canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

if(!canUseDOM){
	logger = function(){
		return (store) => (next) => (action) => {
			return next(action);
		}
	};
}else{
	if(process.env.NODE_ENV==='dev'){
		logger = require('redux-logger');
		logger = logger.default || logger;
	}else{
		logger = function(){
			return (store) => (next) => (action) => {
				return next(action);
			}
		};
	}
}

function checkType(){
	return (store) => (next) => (action) => {
		action.type = action.type || action.CALL_API.type || null;
		return next(action);
	}
}

export default function ConfigureStore(rootReducer, middlewares, initialState) {
	const defaultMiddlewares = [thunk, checkType(), logger()];
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