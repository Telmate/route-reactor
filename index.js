var Router = require('./router'),
    reactRenderer = require('./react_renderer'),
    polyfill = require('html5-history-api'),
    routerInstance = null;

module.exports = function getInstance(renderer, options) {
  if (!routerInstance) {
    routerInstance = new Router();
  }
  routerInstance.configure(renderer, options)
  return routerInstance;
};

module.exports.reactRenderer = reactRenderer;