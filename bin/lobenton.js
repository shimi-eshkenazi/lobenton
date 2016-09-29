#!/usr/bin/env node

var exec = require('child_process').exec;
var lobenton = null;
var config = false;
var arg = null;
var index = 0;
var args = process.argv.slice(2);

function puts(error, stdout, stderr) {
    console.log(stdout);
}

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
      
      exec(`mkdir lib public public/build public/css public/js public/images runtime src src/client src/client/actions src/client/components src/client/containers src/client/locates src/client/middlewares src/client/reducers src/configs src/server src/server/controllers src/server/filters src/server/middlewares`, puts);
      //exec("", puts);
      //exec("", puts);
      
      break;
      
    case '--config':
      config = arg.split('=')[1] || null;
      break;
  }
  
  index++;
}

process.exit();