'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _livereload = require('livereload');

var _livereload2 = _interopRequireDefault(_livereload);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Log = _logger2.default.level('Server');

var Server = {
  instance: undefined,
  start: function start(next) {
    Server.instance = _livereload2.default.createServer();
    Server.instance.watch(process.cwd() + "/dist");

    Log.log('The server is listening for changes.');

    next();
  }
};

exports.default = Server;