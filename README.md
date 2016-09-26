# Lobenton

Easy to create a web application.

## Installing
```bash
$ mkdir project-name
$ cd project-name
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

## Change layout and view src
src/server/controllers/MeController.js
```javascript
	class MeController extends BaseController {
		constructor() {
			super();
			this.layout = "src/client/containers/IndexLayout"; // change layout src
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



