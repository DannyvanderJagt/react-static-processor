'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Log = _logger2.default.level('Config');

// Module.

// Logging...
var Config = {
  path: _path2.default.join(process.cwd(), 'telescope.config.js'),
  data: {},

  load: function load(next) {

    // Check existance.
    if (!_fs2.default.existsSync(Config.path)) {
      Log.error('The config file can\'t be found!');
      return;
    }

    // Load the file.
    try {
      Config.data = require(Config.path);
    } catch (error) {
      Log.error('We couldn\'t load the config file due to this error:', error.message);
      return;
    }
    next();
  }
};

exports.default = Config;