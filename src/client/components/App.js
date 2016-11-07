"use strict";

import React, { Component } from 'react';

class App extends Component {
	constructor( props, context ){
		super( props, context );
	}
	
	getParamMap(){
		return Object.assign({}, this.props.params, this.props.location.query);
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