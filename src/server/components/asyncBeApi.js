"use strict";

var AsyncFetchHelper = require('async-fetch-helper');
var Promise = require('bluebird');
var clientConfig = require('src/configs/client').default;
var asyncFetchHelper = new AsyncFetchHelper({
	apiUrl : "http:"+clientConfig.remoteDataUrl
});

function asyncBeApi(req){
	return function storeHandle(store){
		return function nextHandle(next){
	 		return function actionHandle(action){
	 			if ( !action['CALL_API'] ) {
					return next(action);
				}

				var request = action['CALL_API'];
				var type = request.type;
				var httpMethod = request.method;
				var host = request.host || '';
				var target = request.target;
				var params = request.params || {};
				var header = request.header || {};
				var namespace = '';
				
				header.cookies = req.headers.cookie || "";

				if(/\:.+/.test(target)){
					var targetArray = target.split('/');
					var namespaceAry = [];
				
					targetArray.map(function spaceHandle(space){
						if(space){
							if(/\:.+/.test(space)){
								var name = space.replace(':', '');
								
								if(params[name]){
									namespaceAry.push(params[name]);
									delete params[name];
								}
							}else{
								namespaceAry.push(space);
							}
						}
					});
					
					namespace = '/' + namespaceAry.join('/');
				}else{
					namespace = target;
				}
				
				httpMethod = httpMethod.toLowerCase();
				target = '/ajax' + namespace;
				
				if(host){
					target = host + '/ajax' + namespace;
				}

				return new Promise(function promiseHandle(resolve, reject){
					asyncFetchHelper.need(['rest']).then(function(rest){
						return [
							rest(httpMethod, target, params, header, 'response')
						];
					}).end(function(results){
						var result = results[0];

						next({
							type: type,
							response: {response:result}
						});
						
						resolve({response:result});
					});
				});
			};
		};
	};
};

module.exports = asyncBeApi;