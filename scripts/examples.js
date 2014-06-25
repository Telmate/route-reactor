var http = require('http');
var express = require('express');
var ecstatic = require('ecstatic');
var path = require('path');
var fs = require('fs');
var open = require('open');
var browserify = require('browserify');

var bundler = browserify();
bundler.add(path.resolve(__dirname, '..', 'examples', 'index.js'));
bundler.bundle(function(err, src) {
  if (err) {
    return console.warn(err);
  }
  fs.writeFileSync(path.resolve(__dirname, '..', 'examples', '.tmp', 'dist.js'), src, 'utf8');
});

var app = express();
app.use(ecstatic({
  root: path.resolve(__dirname, '..', 'examples', '.tmp'),
  handleError: false,
  autoIndex: true
}));
app.use(ecstatic({
  root: path.resolve(__dirname, '..', 'examples'),
  handleError: false,
  autoIndex: true
}));

// TODO: render index.html when file is missing
// app.get('/*', function() {});

http.createServer(app).listen(8080, function() {
  console.log('Listening on localhost:8080');
  open('http://localhost:8080');
});
