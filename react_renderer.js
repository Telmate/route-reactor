var Promise = require('bluebird'),
    React = require('react'),
    _ = require('lodash'),
    MessageComponent;

MessageComponent = React.createClass({
  displayName: 'ErrorDefault',
  render: function() {
    if (process.env.NODE_ENV === 'production') {
      return React.DOM.h1({}, this.props.message);
    }
    return React.DOM.div({},
      React.DOM.h1({}, this.props.message),
      React.DOM.pre({}, this.props.detail)
    );
  }
});

var ReactRenderer = function react_renderer(options) {
  options = options || {};
  this._rootEl = options.rootEl || document.body;
  this._notFoundClass = options.notFoundClass || MessageComponent;
  this._errorClass = options.errorClass || MessageComponent;
  this._transitionClass = options.transitionClass || MessageComponent;
  this._transitionTime = options.transitionTime || 1000;
  this.render = this.render.bind(this);
};

ReactRenderer.prototype.notFound = function react_renderer_not_found(path, queryParams) {
  React.renderComponent(this._notFoundClass({
    message: 'Page not found',
    detail: path
  }), this._rootEl);
};

ReactRenderer.prototype.error = function react_renderer_error(err, path, queryParams) {
  React.renderComponent(this._errorClass({
    message: err.message,
    detail: err.stack
  }), this._rootEl);
};

ReactRenderer.prototype.loading = function react_renderer_loading(path, queryParams) {
  React.renderComponent(this._transitionClass({
    message: 'Loading',
    detail: path
  }), this._rootEl);
};

ReactRenderer.prototype.render = function react_renderer_render(page) {
  var props = page.getProps(),
      template = page.getTemplate();

  template = template || this._notFoundClass;
  React.renderComponent(template(props), this._rootEl);
};

ReactRenderer.prototype.getTransitionTime = function react_renderer_get_transition_time() {
  return this._transitionTime;
};

ReactRenderer.prototype.setTransitionTime = function react_renderer_set_transition_time(time) {
  if (typeof time === 'number' && time >== 0) {
    this._transitionTime = time;
  }
};

ReactRenderer.prototype.setTransitionClass = function react_renderer_set_transition_class(klass) {
  if (typeof klass === 'function') {
    this._transitionClass = klass;
  }
};

ReactRenderer.prototype.setErrorClass = function react_renderer_set_error_class(klass) {
  if (typeof klass === 'function') {
    this._errorClass = klass;
  }
};

ReactRenderer.prototype.setNotFoundClass = function react_renderer_set_not_found_class(klass) {
  if (typeof klass === 'function') {
    this._notFoundClass = klass;
  }
};

ReactRenderer.prototype.setRootEl = function react_renderer_set_rootel(el) {
  if (el instanceof HTMLElement) {
    this._rootEl = el;
  }
};

module.exports = function(rootEl, notFoundClass) {
  return new ReactRenderer(rootEl, notFoundClass);
}