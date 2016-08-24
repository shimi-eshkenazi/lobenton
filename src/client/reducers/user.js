"use strict";

import deepAssign from 'deep-assign';
import * as userActions from '../actions/user';

export default function userReducer(state = { pid: -3, userName: -3, isLogin: false, loginTime: 0 }, action) {
	switch(action.type){
		case userActions.LOADED_USER:
			return action.response;
			
		case userActions.GET_AC_USERNAME:
			if (action.response && action.response.success === 'true') {
				state.userName = action.response.data;
			}
			return state;
			
		default:
			return state;
	}
};