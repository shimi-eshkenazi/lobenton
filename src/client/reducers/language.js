"use strict";

import * as languageActions from '../actions/language';

export default function languageReducer(state = 'zhTW', action) {
	switch(action.type){
		case languageActions.CHANGED_LANGUAGE:
			return action.response;
			
		default:
			return state;
	}
};