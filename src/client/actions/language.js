"use strict";

import CookieUtil from'../../utils/CookieUtil.js';

export const  CHANGED_LANGUAGE = "CHANGED_LANGUAGE";
export function changeLanguage(language) {
	CookieUtil.setCookie('locale', language, 900000, '/');

	return {
		type: CHANGED_LANGUAGE,
		response: language
	};
};