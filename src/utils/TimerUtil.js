"use strict";

let timerMap = {};

class TimerUtil {
	static start(cate, noConsole) {
		if(!timerMap[cate]){
			const startTime = (new Date()).getTime();
			timerMap[cate] = {
				start: startTime
			}
		}
		
		if(!noConsole){
			console.log("Timer : '" + cate + "' is started");
		}
	}
	
	static end(cate, noConsole){
		if(!timerMap[cate]){
			if(!noConsole){
				console.log("Timer '" + cate + "' is not setting 'start'");
			}
		}else{
			const endTime = (new Date()).getTime();
			const diff = ((endTime-timerMap[cate].start)/1000);
			delete timerMap[cate];
			
			if(!noConsole){
				console.log("Timer : '" + cate + "' is stoped");
				console.log("Spend time of " + cate + " : " + diff);
			}else{
				return diff;
			}
		}
	}
}

export default TimerUtil;