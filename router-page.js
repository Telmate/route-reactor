var Promise = require('bluebird'),
    _ = require('lodash');

var RouterPage = function router_page(definition) {
  this._definition = definition;
  this._props = {};
};

RouterPage.prototype.setProp = function router_page_set_prop(propName, propValue) {
  this._props[propName] = propValue;
};

RouterPage.prototype.setProps = function router_page_set_props(props) {
  this._props = _.merge(this._props, props);
}

RouterPage.prototype.getProps = function router_page_get_props() {
  return this._props;
};

RouterPage.prototype.getTemplate = function router_page_get_template() {
  return this._definition.template;
};

RouterPage.prototype.initialize = function router_page_initialize(queryParams) {
  if (typeof this._definition.initialize === 'function') {
    this._definition.initialize.call(this, queryParams);
  }
}

module.exports = function(definition) {
  return new RouterPage(definition);
}