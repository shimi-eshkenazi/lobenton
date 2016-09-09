"use strict";

exports.default = function (babel) {
  return {
    visitor: {
      ImportDeclaration(path) {
        if(/^src\/.+/.test(path.node.source.value)){
          path.node.source.value = path.node.source.value.replace(/^src\//g,"lib/");
        }
      },
      CallExpression(path) {
        if(path.node.arguments.length > 0){
          path.node.arguments.map(function loop(node, index){
            if(node.type === "StringLiteral" && /^src\/.+/.test(node.value)){
              node.value = node.value.replace(/^src\//g,"lib/");
            }
          });
        }
      }
    }
  };
};

module.exports = exports["default"];