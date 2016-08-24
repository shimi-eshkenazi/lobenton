"use strict";

import i18next from "i18next";
import path from "path";

class I18nDetector {
	constructor() {
		this.defaultLanguage = null;
		this.nowLanguage = null;
		this.localesPath = null;
		this.i18next = null;
		this.needSetCookie = false;
	}
	
	setDefaultLanguage(defaultLanguage) {
		this.defaultLanguage = defaultLanguage;
	}
	
	setLocalesPath(localesPath) {
		this.localesPath = localesPath;
	}
	
	detect(cookies) {
		let cookie = cookies.locale;
		let settings = {
			"lng" : cookie,
			"fallbackLng" : 'en',
			"resources" : {}
		};
		
		if (cookie === undefined || !I18nDetector.hasOwnProperty(cookie.toUpperCase())){
			console.log("now is : " + cookie);
			this.needSetCookie = true;
			cookie = this.defaultLanguage;
			settings.lng = this.defaultLanguage;
		}
		
		this.nowLanguage = settings.lng;
		settings.resources[cookie] = require(path.join(this.localesPath, settings.lng, settings.lng+".js"));
		this.i18next = i18next.init(settings);
	}
	
	getRealInstance() {
		return this.i18next;
	}
	
	getLanguage() {
		return this.nowLanguage;
	}
	
	getNeedSetCookie() {
		return this.needSetCookie;
	}
}

I18nDetector.EN = "en";
I18nDetector.ZHTW = "zhTW";

export default I18nDetector;