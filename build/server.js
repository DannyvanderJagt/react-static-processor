'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _livereload = require('livereload');

var _livereload2 = _interopRequireDefault(_livereload);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _serveIndex = require('serve-index');

var _serveIndex2 = _interopRequireDefault(_serveIndex);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Log = _logger2.default.level('Server');

var Server = {
  livereload: undefined,
  server: undefined,
  app: undefined,

  start: function start(next) {
    var path = _path2.default.join(process.cwd(), 'dist');

    // Express server.
    Server.app = (0, _express2.default)();

    // Middleware.
    Server.app.use(_express2.default.static(path));
    Server.app.use((0, _serveIndex2.default)(path, { 'icons': true }));

    // Config.
    if (_config2.default.data.server && _util2.default.isArray(_config2.default.data.server)) {
      _config2.default.data.server.forEach(function (path) {
        Server.app.use(_express2.default.static(path));
      });
    }

    Server.server = Server.app.listen(4000, function () {
      var port = Server.server.address().port;
      Log.note('The server is available at: http://localhost:' + port);
    });

    // Live reload server.
    Server.livereload = _livereload2.default.createServer();
    Server.livereload.watch(path);
    Log.note('The server is listening for changes.');

    next();
  }
};

exports.default = Server;