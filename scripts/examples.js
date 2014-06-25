var http = require('http');
var express = require('express');
var ecstatic = require('ecstatic');
var path = require('path');
var fs = require('fs');
var open = require('open');

var argv = require('minimist')(process.argv.slice(2), {
  boolean: ['open'],
  string: ['port'],
  default: {
    port: 9000,
    open: false
  }
});

var root = path.resolve(__dirname, '..', 'examples');
console.log(root);

var app = express();

// static files
app.use(ecstatic({
  root: root,
  autoIndex: true,
  showDir: false,
  baseDir: '/',
  handleErrors: false
}));

// missing files go to index.html
app.use(function(req, res, next) {
  if (req.headers && req.headers['x-requested-with'] === 'XMLHttpRequest') {
    return next();
  }
  res.statusCode = 200;
  res.write(fs.readFileSync(path.resolve(root, 'index.html'), 'utf8'));
  res.end();
});

http.createServer(app).listen(argv.port, function() {
  console.log('Listening on localhost:' + argv.port);
  if (argv.open) {
    open('http://localhost:' + argv.port);
  }
});
