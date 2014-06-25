var assert = require('chai').assert,
  sinon = require('sinon'),
  routeReactor = require('..'),
  renderApi,
  renderMock,
  router;

renderApi = {
  notFound: function() {},
  loading: function() {},
  error: function() {},
  render: function() {},
  getTransitionTime: function() {}
};
renderMock = sinon.mock(renderApi);
router = routeReactor(renderApi);

describe('route-reactor router api', function() {
  beforeEach(function() {

  });
  afterEach(function() {
    renderMock.verify();
  });

  it('should define pages', function() {
    assert.doesNotThrow(function() {
      router.page('/', {})
    });
  });
});