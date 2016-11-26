"use strict";

import React, { Component } from 'react';
import { withRouter } from 'react-router';
import {closeLayer} from '../actions/layerControl';

class App extends Component {
	constructor( props, context ){
		super( props, context );
	}
	
	componentDidMount(){
		var root = document.getElementById('root');
		root.addEventListener('click', this.handleRootClick.bind(this));
	}
	
	handleRootClick(e) {
		closeLayer(e);
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