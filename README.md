# Lobenton

Easy to create a web application for server and client.

## Installing
```bash
$ mkdir project-name
$ cd project-name
$ npm init
$ npm install lobenton --save
```

## Initial project
```bash
$ lobenton --init
```

## Add routes 
src/configs/config.js
```javascript
	...
	"components"  : {
		"urlManager"  : {
			"rules" : {
				"/" : "index/view",
				"/me" : "me/view" // add this
			}
		}
	},
	...
```

## Change layout and view src on annotation
src/server/controllers/MeController.js
```javascript
	class MeController extends BaseController {
		/**
		 * constructor
		 * @layout: src/client/containers/MeLayout // change layout src
		 */
		constructor() {
			super();
		}
		
		/**
		 * actionView
		 * @view: src/client/containers/me/view // change view src
		 */
		actionView() {
			this.render();	
		}	
	}
```

## Add layout and view to containers
src/client/containers/MeLayout.js
```javascript
	import React, { Component } from 'react';
	import {WrapComponent} from 'lobenton/client';
	import clientConfig from 'src/configs/client';
	
	class MeLayout extends Component {
		constructor( props, context ){
			super( props, context );
		}
		
		render() {
			return (
				<html>  
					<head>
						<title>Lobenton</title>
						<meta charSet="UTF-8" />
						{clientConfig.env !== 'dev' && '<link rel="stylesheet" href="'+clientConfig.params.staticWapUrl+'/build/'+clientConfig.name+'.css" />'}
					</head>  
					<body>
						<div id="root" dangerouslySetInnerHTML={{__html:this.props.children}}></div>
						<script type="application/json" id="reduxState" charSet="utf-8" dangerouslySetInnerHTML={{__html:JSON.stringify(this.props.reduxState)}}></script>
						<script type="text/javascript"  src={clientConfig.params.staticWapUrl+"/build/"+clientConfig.name+"_en.js"}></script>
						<script type="text/javascript"  src={clientConfig.params.staticWapUrl+"/build/"+clientConfig.name+"_zhTW.js"}></script>
						<script type="text/javascript"  src={clientConfig.params.staticWapUrl+"/build/"+clientConfig.name+"_bundle.js"}></script>
					</body>
				</html> 
			);
		}
	}
	
	export default WrapComponent()(MeLayout);
```

src/client/containers/me/view.js
```javascript
	import React, { Component } from 'react';
	import {WrapComponent} from 'lobenton/client';
	import css from './view.css';

	class IndexView extends Component {
		constructor( props, context ) {
			super( props, context );
		}
		
		render() {
			return (
				<div>
					me page
				</div>	
			);
		}
	}	
		
	function mapStateToProps (state, props) {
		return {};
	}

	function mapDispatchToProps(dispatch) {
		return {
			actions: {}
		}
	}
	
	export default WrapComponent(mapStateToProps, mapDispatchToProps)(IndexView, css)
```

## Start dev server
```bash
$ npm run dev
```

## Start non dev server
```bash
$ npm start
```

## Stop server
```bash
$ npm stop
```

## ES6 to ES5
```bash
$ npm run babel
```

## Create React Router
```bash
$ npm run router
```

## bundle client js
```bash
$ npm run build
```




