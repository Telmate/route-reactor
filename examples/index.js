var React = require('react');

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
var reactRenderer = require('..').reactRenderer({
  rootEl: document.getElementById('app-container'),
  // transitionClass: MyReactLoadingPage,
  transitionTime: 2000
});

// configure the router, passing in the renderer
var router = require('..')(reactRenderer);

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