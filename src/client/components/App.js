"use strict";

import React, { Component } from 'react';

class App extends Component {
	constructor( props, context ){
		super( props, context );
		this.paramMap = {};
	}
	
	getParamMap(){
		if(!this.paramMap || (Object.keys(this.paramMap).length === 0 && typeof this.props.params !== 'undefined' && typeof this.props.location !== 'undefined')){
			this.paramMap = Object.assign({}, this.props.params, this.props.location.query);
		}
		
		return this.paramMap;
	}
	
	render() {
		return React.cloneElement(this.props.children, {
			getParamMap : this.getParamMap.bind(this),
			params: this.props.params,
			location: this.props.location
		});
	}
}

export default App;