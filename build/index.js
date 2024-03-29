'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Component = undefined;

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _ui = require('./ui');

var _ui2 = _interopRequireDefault(_ui);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

var _pages = require('./pages');

var _pages2 = _interopRequireDefault(_pages);

var _server = require('./server');

var _server2 = _interopRequireDefault(_server);

var _watcher = require('./watcher');

var _watcher2 = _interopRequireDefault(_watcher);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Import doesn't work when used in
// a UI component because
// of the .default added by babel.
var Component = require('./component');

// Logging.

var Log = _logger2.default.level('Telescope');

// Welcome message
var welcome = function welcome(next) {
  Log.note('Welcome!');
  next();
};

var leave = function leave() {
  Log.note('Thank you for using Telescope.');
  Log.note('Have an awesome day!');
};

var Telescope = {
  Component: Component,
  start: function start() {
    _async2.default.series([welcome, _config2.default.load,

    // The /ui and /pages directory are required!
    _ui2.default.exists, _pages2.default.exists,

    // Watch ui components.
    _watcher2.default.watchUI,

    // Wait until all the ui components are compiled.
    _ui2.default.waitUntilInitialReadIsDone,

    // Watch pages.
    _watcher2.default.watchPages,

    // Wait until all the pages are compiled.
    _pages2.default.waitUntilInitialReadIsDone, _watcher2.default.watchConfig, _watcher2.default.watchConfigStylesheets, _server2.default.start]);
  },
  stop: function stop() {
    process.exit();
  }
};

// Remove the cache on exit.
process.on('SIGINT', function () {
  process.exit();
});

process.on('exit', function () {
  _cache2.default.destroy();
  leave();
});

// Support import es2015.
exports.default = Telescope;
exports.Component = Component;

// Support require es5.

module.exports = Telescope;
exports.Component = Component;