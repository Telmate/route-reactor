route-reactor
=============

Framework-agnostic client-side router (uses page.js, plays well with React)

## Summary

`route-reactor` offers a simple API on top of [page.js](https://github.com/visionmedia/page.js) for routing client-side applications. Routes are specified with expressjs-style strings, such as `/user/:userId` or `/posts/*`. For a given route you define a `page` which specifies the resources for that page and the template that will be rendered. `route-reactor` handles asyncrhonous loading those resources and then rendering the page. During resource loading it will render a loading page, offering a smoother page transition experience than typical routers.

## Installation

Install:

	npm install --save route-reactor

then:

	var routeReactor = require('route-reactor');

## Usage

Note that `route-reactor` is meant for use via browserify or other front-end packagers.

See a full, working version of the below in `examples/index.js` - run it with `npm start`.

```javascript
// configure a renderer, in this case for ReactJS page templates
var reactRenderer = require('route-reactor').reactRenderer({
	rootEl: document.getElementById('app-container'),
	transitionClass: MyReactLoadingPage,
	transitionTime: 2000
});

// configure the router, passing in the renderer
var router = require('route-reactor')(reactRenderer);

// define a page
router.page('/', {
	template: MyReactComponent,
	initialize: function(queryParams) {
		// set the template property 'syncProp' to the query param value
		this.setProp('syncProp', queryParams.syncProp);

		// set the template property 'async' to the value that a promise
		// resolves to, in this case 'hello!'
		this.setProp('async', Promise.resolve('hello!').delay(1000));
	}
});

// start the router 
router.start();
```

For a URL such as `/?syncProp=123`, the above will go through the following flow:
- call the `initialize()` function of the `/` page
- notices that 1+ props are asynchronous (eg the 'async' prop)
- renders `MyReactLoadingPage` for at least 2s (to avoid flashing it briefly)
- waits until both 2s have elapsed and all async props have loaded
- finally renders the page's template `MyReactComponent`

The final render will use props set in `initialize()`: in this case:
```javascript
{
	syncProp: 123,
	async: 'hello!'
}
```


## Development Guide

Run tests:

	npm test

Run examples (leave off `--open` to skip opening a browser):

	npm run build
	node scripts/examples.js --port 9000 --open

## License

The MIT License (MIT)

Copyright (c) 2014 Joseph Savona

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
