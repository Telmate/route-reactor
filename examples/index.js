var React = require('react'),
    Promise = require('bluebird');

var MyReactComponent = React.createClass({
  render: function() {
    return (
      React.DOM.div({},
        React.DOM.h1({}, this.props.syncProp || 'no query param'),
        React.DOM.p({}, this.props.async)
      )
    );
  }
});

// configure a renderer, in this case for ReactJS page templates
var reactRenderer = require('../router').reactRenderer({
  rootEl: document.getElementById('app-container'),
  // transitionClass: MyReactLoadingPage,
  transitionTime: 2000
});

// configure the router, passing in the renderer
var router = require('../router')(reactRenderer);

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

// obvserve routing events
router.on(router.events.WILL_NAVIGATE, console.log.bind(console));
router.on(router.events.DID_NAVIGATE, console.log.bind(console));
router.on(router.events.CANCELLED, console.log.bind(console));
router.on(router.events.ERROR, function(err, url, query) {
  console.warn(err.stack || err.message);
});

// start the router 
router.start();