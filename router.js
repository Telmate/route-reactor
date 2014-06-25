var assert = require('assert'),
    util = require('util'),
    events = require('events'),
    EventEmitter = events.EventEmitter,
    _ = require('lodash'),
    page = require('page'),
    querystring = require('querystring'),
    Promise = require('bluebird'),
    RouterPage = require('./router_page');

var Router = function router() {
  EventEmitter.call(this);
  this._started = false;
  this._renderer = null;
  this._routerPromise = null;
  this._renderPromise = null;

  // first catch-all route for querystring parsing
  page('*', function(ctx, next) {
    ctx.query = _.merge(querystring.parse(ctx.querystring), ctx.params);
    next();
  });
};

// Router instanceof EventEmitter
util.inherits(Router, EventEmitter);

/*
 *  namespaced events
 */
Router.prototype.events = Router.EVENTS = {
  WILL_START: 'routerWillStart',
  DID_START: 'routerDidStart',
  WILL_NAVIGATE: 'routerWillNavigate',
  DID_NAVIGATE: 'routerDidNavigate',
  ERROR: 'routerError',
  WARN: 'routerWarn',
  NOT_FOUND: 'routerNotFound',
  CANCELLED: 'routerCancelled'
};

/**
 * configure(options)
 * @param {Function} renderer: function that given data will render the page
 * @param  {Object} options: options
 * @return {None}
 *
 * Configures options for the router - currently:
 * options.base: a base path if the app is served at anything besides '/' root
 */
Router.prototype.configure = function router_configure(renderer, options) {
  options = options || {};
  this._renderer = renderer;

  assert(renderer !== null, 'invalid renderer - null - see documentation');
  assert(typeof renderer.notFound === 'function', 'invalid renderer - notFound() - see documentation');
  assert(typeof renderer.error === 'function', 'invalid renderer - error() - see documentation');
  assert(typeof renderer.loading === 'function', 'invalid renderer - loading() - see documentation');
  assert(typeof renderer.render === 'function', 'invalid renderer - render() - see documentation');
  assert(typeof renderer.getTransitionTime === 'function', 'invalid renderer - getTransitionTime() - see documentation');

  if (options.base) {
    page.base(options.base);
  }
};

/**
 * page(url, page)
 * @param  {String} url: an express/rails-style url with :params
 * @param  {Object} pageDefinition: Object describing the page with initialize() fn to set props
 * @return {None}
 *
 * Defines a page as a url -> page mapping.
 */
Router.prototype.page = function router_page(url, pageDefinition) {
  var pageObject = new RouterPage(pageDefinition);
  if (this._started) {
    return this.emit(this.events.WARN, 'Router already started but tried to define page()', url);
  }
  page(url, function(ctx, next) {
    this._navigate(url, ctx, pageObject);
  }.bind(this));
};

/**
 * start()
 * @return {None}
 *
 * Starts routing by routing the current window URL to its route.
 */
Router.prototype.start = function router_start() {
  // block additional pages from being defined after not found handler
  this._started = true;
  // add a catch-all not found handler
  page('*', function(ctx) {
    this._notFound(ctx);
  }.bind(this));

  this.emit(this.events.WILL_START);
  page();
  this.emit(this.events.DID_START);
};

/**
 * go(url)
 * @param  {String} url: a url to navigate to
 * @return {None}
 *
 * Navigates to the given url
 */
Router.prototype.go = function router_go(url) {
  page.show(url);
};

/**
 * _navigate(url, ctx, fn)
 *
 * internal function to navigate to a page
 */
Router.prototype._navigate = function router_navigate(url, ctx, page) {
  this._render(ctx, function(promise) {
    return promise.then(function() {
      var props, propsWithPromise, mergedPromise; 
      page.initialize(ctx.query);

      // get subset of props (name->value) map where value is a promise
      props = page.getProps();
      propsWithPromise = {};
      _.forEach(props, function(propValue, propName) {
        if (propValue instanceof Promise) {
          propsWithPromise[propName] = propValue;
        }
      });

      // create a merged promise that will resolve when all values
      // in the subset have resolved
      mergedPromise = Promise.props(propsWithPromise);

      if (mergedPromise.isFulfilled()) {
        // no async props: return instantly w/o showing interstitial
        return Promise.all([mergedPromise]).cancellable();
      } else {
        // has async props: show interstitial until both:
        // - and the async props have loaded
        // - the loading time has passed
        this._renderer.loading(ctx.canonicalPath, ctx.query);
        return Promise.all([
          mergedPromise,
          Promise.resolve().delay(this._renderer.getTransitionTime())
        ]).cancellable();
      }
    })
    .spread(function(asyncProps) {
      page.setProps(asyncProps);
      this._renderer.render(page);
    });
  });
};

/**
 * _notFound(ctx)
 *
 * internal function to handle an undefined route
 */
Router.prototype._notFound = function router_not_found(ctx) {
  this._render(ctx, function(promise) {
    return promise.then(function() {
      this.emit(this.events.NOT_FOUND, ctx.canonicalPath, ctx.query);
      this._renderer.notFound(ctx.canonicalPath, ctx.query);
    });
  });
};

/**
 * _cancel()
 *
 * internal function to cancel any in-progress routing
 */
Router.prototype._cancel = function router_cancel() {
  if (this._routerPromise !== null) {
    this._routerPromise.cancel();
    this._routerPromise = null;
  }
};

/**
 * _render(ctx, fn)
 *
 * wrapper for a rendering cycle - handles before/after
 * cleanup for both _navigate and _notFound
 */
Router.prototype._render = function router_render(ctx, fn) {
  // pre-events and setup
  this._cancel();
  this._routerPromise = Promise.bind(this)
  .cancellable()
  .then(function() {
    this.emit(this.events.WILL_NAVIGATE, ctx.canonicalPath, ctx.query);
  });
  // per-route handling
  this._routerPromise = fn(this._routerPromise);
  // post-route
  this._routerPromise.then(function() {
    this.emit(this.events.DID_NAVIGATE, ctx.canonicalPath, ctx.query);
  })
  .catch(Promise.CancellationError, function(err) {
    this.emit(this.events.CANCELLED, err, ctx.canonicalPath, ctx.query);
  })
  .catch(function(err) {
    this.emit(this.events.ERROR, err, ctx.canonicalPath, ctx.query);
    return this._renderer.error(err, ctx.canonicalPath, ctx.query);
  })
  .catch(function(err) {
    this.emit(this.events.ERROR, err, ctx.canonicalPath, ctx.query);
  })
  .finally(function() {
    this._routerPromise = null;
  });
};

/**
 * emit(event, args...)
 *
 * override the emit function to always send the event name as first arg
 */
Router.prototype.emit = function router_emit() {
  var args = _.toArray(arguments);
  args.unshift(args[0]);
  EventEmitter.prototype.emit.apply(this, args);
};

module.exports = Router;
