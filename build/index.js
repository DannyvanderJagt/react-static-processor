'use strict';

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

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Log = _logger2.default.level('Telescope');

// Compile all the UI elements.

// Logging.
Log.mention('Starting...');

_async2.default.series([_config2.default.load, _cache2.default.create,

// Ui components.
_ui2.default.createIndex, _ui2.default.compileAll,

// Compile pages.
_pages2.default.createIndex, _pages2.default.compileAll]);

process.on('exit', function () {
  // Cache.destroy();
});