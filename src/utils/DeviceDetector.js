"use strict";

import MobileDetect from "mobile-detect";

class DeviceDetector {
	constructor() {
		this.defaultDevice = null;
		this.nowDevice = null;
		this.mobileDetect = null;
	}
	
	setDefaultDevice(device) {
		this.defaultDevice = device;
	}
	
	detect(request) {
		this.mobileDetect = new MobileDetect(request.headers['user-agent']);
		this.nowDevice = this.defaultDevice;
		
		try {
			if(this.mobileDetect.mobile() === null && this.mobileDetect.tablet() === null){
				this.nowDevice = 'desktop';
			}else if(this.mobileDetect.mobile() !== null && this.mobileDetect.tablet() === null){
				this.nowDevice = 'mobile';
			}else{
				this.nowDevice = 'tablet';
			}
		}catch(e){}
	}
	
	getRealInstance() {
		return this.mobileDetect;
	}
	
	getDevice() {
		return this.nowDevice;
	}
}

DeviceDetector.DESKTOP = "desktop";
DeviceDetector.MOBILE = "mobile";
DeviceDetector.TABLET = "tablet";

export default DeviceDetector;