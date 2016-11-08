"use strict";

import React, { Component } from 'react';
import { withRouter } from 'react-router';

class App extends Component {
	constructor( props, context ){
		super( props, context );
	}
	
	getParamMap(){
		return Object.assign({}, this.props.params, this.props.location.query);
	}
	
	render() {
		let props = Object.assign({}, this.props);
		
		delete props.children;
		
		return React.cloneElement(this.props.children, {
			getParamMap : this.getParamMap.bind(this),
			...props
		});
	}
}

export default withRouter(App);