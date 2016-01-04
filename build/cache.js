'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Log = _logger2.default.level('Cache');

// Module.

// Logging...
var Cache = {
  path: _path2.default.join(process.cwd(), '.cache'),

  create: function create(next) {
    if (_fsExtra2.default.existsSync(Cache.path)) {
      Cache.destroy();
    }

    Log.mention('created...');

    _fsExtra2.default.mkdirsSync(Cache.path);

    if (next) {
      next();
    }
  },
  destroy: function destroy(next) {
    _fsExtra2.default.removeSync(Cache.path);

    Log.mention('destroyed...');

    if (next) {
      next();
    }
  },
  store: function store(path, filename, content) {
    if (!path) {
      path = '';
    };
    path = _path2.default.join(Cache.path, path);
    _fsExtra2.default.mkdirsSync(path);

    path = _path2.default.join(path, filename);

    _fsExtra2.default.writeFileSync(path, content);
    return path;
  },
  remove: function remove(path, filename) {
    if (!path) {
      path = '';
    };
    path = _path2.default.join(Cache.path, path, filename);
    _fsExtra2.default.unlinkSync(path);
    return path;
  }
};

exports.default = Cache;