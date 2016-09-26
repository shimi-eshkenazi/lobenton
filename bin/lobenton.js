#!/usr/bin/env node

var lobenton = null;
var config = false;
var arg = null;
var index = 0;
var args = process.argv.slice(2);

while(arg = args[index]){
	var flag = arg.split('=')[0];

  switch (flag) {
    case '--create-reate-router':
      lobenton = lobenton || require('../lib/index.js').default;
      
    	if(config === false){
    		args.push('--create-reate-router');
    	}else if(config !== null && config !== false){
    		lobenton.createApplication(config).runSimple();
    	}
      break;
      
    case '--init':
      var locate = process.env.PWD;
      break;
      
    case '--config':
      config = arg.split('=')[1] || null;
      break;
  }
  
  index++;
}

process.exit();