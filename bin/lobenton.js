#!/usr/bin/env node

var lobenton = require('../lib/index.js').default;
var config = false;
var arg = null;
var index = 0;
var args = process.argv.slice(2);

while(arg = args[index]){
	var flag = arg.split('=')[0];

  switch (flag) {
    case '--create-reate-router':console.log("OK");
    	if(config === false){
    		args.push('--create-reate-router');
    	}else if(config !== null && config !== false){
    		lobenton.createApplication(config).runSimple();
    	}
      break;
      
    case '--config':
      config = arg.split('=')[1] || null;
      break;
  }
  
  index++;
}