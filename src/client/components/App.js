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
		return React.cloneElement(this.props.children, {
			getParamMap : this.getParamMap.bind(this),
			...this.props
		});
	}
}

export default withRouter(App);