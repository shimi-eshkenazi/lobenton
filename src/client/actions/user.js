"use strict";

export const  LOADED_USER = "LOADED_USER";
export function loadUser(params) {
	return {
		'CALL_API': {
			type: LOADED_USER,
			method: 'get',
			target: '/user/:pid',
			params: params
		}
	};
};

export const  GET_AC_USERNAME = "GET_AC_USERNAME";
export function getACUserName(params) {
	return {
		'CALL_API': {
			type: GET_AC_USERNAME,
			method: 'get',
			target: '/account/name',
			params: params
		}
	};
};