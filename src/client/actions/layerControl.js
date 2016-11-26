"use strict";

let all_layer = [];

export function registerLayer(callback){
	all_layer = [callback, ...all_layer]
}

export function closeLayer(e) {
	for(var i = 0; i < all_layer.length; i++){
		all_layer[i].call(this, e);
	}
};