"use strict";

let timerMap = {};

class TimerUtil {
	static start(cate) {
		if(!timerMap[cate]){
			const startTime = (new Date()).getTime();
			timerMap[cate] = {
				start: startTime
			}
		}
		
		console.log("Timer : '" + cate + "' is started");
	}
	
	static end(cate){
		if(!timerMap[cate]){
			console.log("Timer '" + cate + "' is not setting 'start'");
		}else{
			const endTime = (new Date()).getTime();
			console.log("Timer : '" + cate + "' is stoped");
			console.log("Spend time of " + cate + " : " + ((endTime-timerMap[cate].start)/1000));
			
			delete timerMap[cate];
		}
	}
}

export default TimerUtil;