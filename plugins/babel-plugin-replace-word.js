"use strict";

exports.default = function (babel) {
  var checkFlag = process.argv.slice(-1).pop() === "--replace-word";

  return {
    visitor: {
      ImportDeclaration(path, state) {
        if(checkFlag === true){
          var opts = Object.keys(state.opts);
          
          if(opts.length > 0){
            opts.map(function loopOpts(source){
              var replaceTo = state.opts[source];
              var re1 = new RegExp(source, "gi");
              
              if(re1.test(path.node.source.value)){
                path.node.source.value = path.node.source.value.replace(re1, replaceTo);
              }
            });
          }
        }
      },
      CallExpression(path, state) {
        if(checkFlag === true && path.node.arguments.length > 0){
          var opts = Object.keys(state.opts);
          
          path.node.arguments.map(function loop(node, index){
            if(opts.length > 0){
              opts.map(function loopOpts(source){
                var replaceTo = state.opts[source];
                var re1 = new RegExp(source, "gi");
                
                if(node.type === "StringLiteral" && re1.test(node.value)){
                  node.value = node.value.replace(re1, replaceTo);
                }
              });
            }
          });
        }
      }
    }
  };
};

module.exports = exports["default"];